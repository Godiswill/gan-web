'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useState, useId, useEffect, useRef, useCallback } from 'react';
// import { removeBackground } from '@imgly/background-removal';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { CloudUploadIcon } from '@/components/svg';
import { formatTime } from '@/lib/utils';
import { exampleImgs, smallModelKey } from '@/lib/const';
import { removeBackground } from '@/lib/remover';
import { isMobileDevice } from '@/lib/remover/utils';
import { ImageType } from '@/lib/types';
import PreviewDownload from './PreviewDownload';
// const PreviewDownload = dynamic(() => import('./PreviewDownload'), {
//   ssr: false,
// });

export default function SelectImage() {
  const fileInputId = useId();
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [outOfMemory, setOutOfMemory] = useState(false);
  const [imgSliders, setImgSliders] = useState<
    {
      beforeFile: Blob & { name: string };
      afterFile?: Blob & { name: string };
      status?: 'fulfilled' | 'rejected' | 'processing';
    }[]
  >();
  const [format, setFormat] = useState<ImageType>(ImageType.PNG);
  const dropRef = useRef<HTMLLabelElement>(null);
  const [time, setTime] = useState('');
  const [wasmOnnxModel, setWasmOnnxModel] = useState(false);

  useEffect(() => {
    const model = window.localStorage.getItem(smallModelKey);
    setWasmOnnxModel(!!model);
  }, []);

  function clearLocalStorage() {
    if (!!new URLSearchParams(window.location.search).get('debug')) {
      window.localStorage.removeItem(smallModelKey);
    }
  }

  function changeModel() {
    const model = 'u2netp.onnx';
    window.localStorage.setItem(smallModelKey, model);
    window.location.reload();
  }

  const handleFiles = useCallback(async (files?: FileList | File[] | null) => {
    if (!files?.length) return;

    const imgFiles = Array.from(files).filter((it) =>
      it.type.startsWith('image/')
    );

    if (!imgFiles?.length) return;
    setOutOfMemory(false);
    setImgSliders(
      imgFiles.map((file) => ({
        beforeFile: file,
      }))
    );
  }, []);

  const remove = useCallback(async () => {
    if (isLoading || !imgSliders?.length) return;

    const startTime = performance.now();
    setIsLoading(true);
    setOutOfMemory(false);
    // const isLow = isLowEndDevice();
    const isMobile = isMobileDevice();
    // const result: Array<PromiseSettledResult<Blob>> = [];
    const model = window.localStorage.getItem(smallModelKey);
    for (const item of imgSliders) {
      const { beforeFile: file } = item;
      try {
        item.status = 'processing';
        setImgSliders([...imgSliders]);
        const output = await removeBackground(file, {
          device: 'gpu',
          // publicPath: `${location.origin}/_models/release/`,
          progress: (key, current, total) => {
            // console.log(`Downloading ${key}: ${current} of ${total}`);
            if (
              typeof current === 'number' &&
              (current === total || total < 8)
            ) {
              setIsDownloading(false);
            } else {
              setIsDownloading(true);
            }
          },
          model: isMobile ? 'isnet_quint8' : 'isnet_fp16',
          ...(model
            ? {
                mInfo: {
                  modelUrl: `/_models/${model}`,
                  size: 320,
                  inputKey: 'input.1',
                },
              }
            : {}),
          debug:
            process.env.NODE_ENV === 'development' ||
            !!new URLSearchParams(window.location.search).get('debug'),
          output: {
            format,
            quality: isMobile ? 0.4 : 0.6,
          },
        });
        item.status = 'fulfilled';
        item.afterFile = Object.assign(output, {
          name:
            file.name.replace(/\.\w+$/, '') +
            '_BgGone' +
            output.type.replace(/^\w+\//, '.'),
        });
      } catch (err) {
        console.error('Failed to process', file.name, err);
        item.status = 'rejected';
        // item.err = err;
      }
    }
    console.log('result', imgSliders);
    const fulfilled = imgSliders.filter((it) => it.status === 'fulfilled');
    console.log('fulfilled', fulfilled);
    if (!fulfilled.length) {
      setOutOfMemory(true);
    }
    setImgSliders([...imgSliders]);
    setIsLoading(false);

    const duringTime = performance.now() - startTime;
    setTime(formatTime(duringTime));
  }, [isLoading, imgSliders, format]);

  useEffect(() => {
    const drop = dropRef.current;
    if (!drop) return;

    function dragOverEvent(e: DragEvent) {
      e.preventDefault();
      drop?.classList.add('drag-over');
    }

    function dragLeaveEvent(e: DragEvent) {
      e.preventDefault();
      drop?.classList.remove('drag-over');
    }

    function dropEvent(e: DragEvent) {
      e.preventDefault();
      drop?.classList.remove('drag-over');
      const files = e.dataTransfer?.files;
      handleFiles(files);
    }

    drop.addEventListener('dragover', dragOverEvent);
    drop.addEventListener('dragleave', dragLeaveEvent);
    drop.addEventListener('drop', dropEvent);

    return () => {
      drop.removeEventListener('dragover', dragOverEvent);
      drop.removeEventListener('dragleave', dragLeaveEvent);
      drop.removeEventListener('drop', dropEvent);
    };
  }, [handleFiles]);

  useEffect(() => {
    function pasteEvent(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      const imgs: File[] = [];
      for (let i = 0; items && i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && file.type.startsWith('image/')) {
            imgs.push(file);
          }
        }
      }
      handleFiles(imgs);
    }
    document.documentElement.addEventListener('paste', pasteEvent);

    return () => {
      document.documentElement.removeEventListener('paste', pasteEvent);
    };
  }, [handleFiles]);

  const [loadingImg, setLoadingImg] = useState(false);
  const [loadingImgLeft, setLoadingImgLeft] = useState(0);
  async function exampleImgClick(
    e: React.MouseEvent<HTMLDivElement | HTMLImageElement, MouseEvent>
  ) {
    const img = e.target;
    if (img instanceof HTMLImageElement) {
      setLoadingImg(true);
      setLoadingImgLeft(img.offsetLeft);
      const blob = await new Promise<Blob | null>((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(resolve);
      });
      // const response = await fetch(e.target.src);
      // const blob = await response.blob();
      if (!blob) {
        throw Error('Image to Blob');
      }
      const file = new File([blob], (e.target as HTMLImageElement).alt, {
        type: blob.type,
      });
      handleFiles([file]);
      setLoadingImg(false);
    }
  }

  const imgs = imgSliders
    ?.filter((it) => !!it.afterFile)
    ?.map((it) => it.afterFile);
  const isDone = !isLoading && !!imgs?.length;

  const downloadSingle = () => {
    if (!isDone) return;

    for (let file of imgs) {
      FileSaver.saveAs(file!, file!.name);
    }
  };

  const downloadAll = async () => {
    if (!isDone) return;

    try {
      const zip = new JSZip();
      imgs.forEach((file) => {
        zip.file(file!.name, file!);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(content, 'BgGone.zip');
    } catch (err) {
      console.error(err);
      alert('Failed to package images.');
    }
  };

  return (
    <>
      <div className="main-width">
        <div className="glass-effect relative text-sm h-48 xs:h-56 sm:h-60 md:h-64 lg:h-72 xl:h-80 3xl:h-96 h- m-auto transition-[border-color]">
          <input
            type="file"
            accept="image/*"
            multiple
            id={fileInputId}
            className="opacity-0 h-0"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {/* <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-black/10 border-r-black/10 rounded-full animate-spin"></div>
            <p className="text-sky-500 mt-4">
              {isDownloading
                ? 'Downloading AI model...'
                : 'Removing background...'}
            </p>
          </div> */}
          <label
            ref={dropRef}
            htmlFor={fileInputId}
            className="drop-zone absolute inset-2 border-2 sm:inset-4 lg:inset-6 sm:border-3 border-dashed border-black/10 dark:border-white/40 rounded-xl flex justify-center items-center cursor-pointer text-center"
          >
            <div>
              <CloudUploadIcon className="h-8 w-8 m-auto" />
              <div className="text-sm sm:text-base">
                <p className="mt-2">Click</p>
                <p className="my-1">Drag & Drop</p>
                <p>Paste Image (Ctrl+V/Cmd+V)</p>
              </div>
            </div>
          </label>
        </div>
        <div className="mt-4 block sm:flex items-center">
          <div
            className="text-center mb-2 sm:text-start text-sm sm:mr-8 xl:text-lg xl:mr-16"
            onClick={clearLocalStorage}
          >
            <p>Start Removing Backgrounds</p>
            <p>No image? Try one of these:</p>
          </div>
          <div
            className="relative flex flex-1 justify-around sm:justify-between"
            onClickCapture={exampleImgClick}
          >
            <div
              className={`absolute inset-0 bg-black/3 ${
                loadingImg ? 'flex' : 'hidden'
              } items-center`}
            >
              <div
                style={{ left: loadingImgLeft }}
                className="absolute ml-5 md:ml-6 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"
              ></div>
            </div>
            {exampleImgs.map(({ src, alt }) => (
              <Image
                key={src}
                className="w-13 md:w-16 rounded-md cursor-pointer"
                src={src}
                alt={alt}
                width={600}
                height={600}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="main-width text-yellow-500 flex justify-center items-center text-sm md:justify-start md:text-base h-7 md:h-8">
        {wasmOnnxModel && (
          <span>Notice: You’re using a lightweight model.</span>
        )}
      </div>
      {!!imgSliders?.length && (
        <div>
          <div className="glass-effect p-4 main-width">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-black/90 dark:text-white/90 flex items-center gap-4">
                <span className="font-semibold">
                  Selected: <span>{imgSliders?.length}</span>
                </span>
                <div className="flex items-center gap-2">
                  <label>Output format:</label>
                  <select
                    className="px-3 py-1 rounded-lg bg-white/20 border border-black/30"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ImageType)}
                  >
                    {Object.values(ImageType).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  disabled={isLoading}
                  onClick={remove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  {isDownloading
                    ? 'Loading...'
                    : isLoading
                    ? 'Removing...'
                    : 'Start'}
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => setImgSliders([])}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all transform hover:scale-105"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="main-width text-rose-600 rounded-md pt-2 pb-6 md:text-lg">
            {outOfMemory && (
              <>
                <span>
                  ⚠️ Your device may struggle with this task. Try using a
                  desktop for better results.
                </span>
                {!wasmOnnxModel && (
                  <button
                    onClick={changeModel}
                    className="mt-2 block w-full text-center py-3 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all"
                  >
                    Try a smaller model?
                  </button>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-3 main-max-width">
            {imgSliders?.map(({ beforeFile, afterFile, status }, index) => (
              <PreviewDownload
                className="break-inside-avoid mb-5 image-card border border-gray-200"
                key={beforeFile.name + (afterFile?.name || '')}
                beforeFile={beforeFile}
                afterFile={afterFile}
                processing={status === 'processing'}
                onClose={() =>
                  setImgSliders(imgSliders.filter((_, i) => i !== index))
                }
              />
            ))}
          </div>
          <div
            className={`main-width glass-effect p-6 mt-4 ${
              isDone ? 'block' : 'hidden'
            }`}
          >
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">
                🎉 Done! Time taken: {time}
              </h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={downloadSingle}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  Download
                </button>
                <button
                  onClick={downloadAll}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  Download All as ZIP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
