'use client';

import { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { formatTime } from '@/lib/utils';
import { smallModelKey } from '@/lib/utils/const';
import { removeBackground } from '@/lib/utils/remover';
import { isMobileDevice } from '@/lib/utils/remover/utils';
import { ImageType } from '@/lib/types';
import PreviewDownload from '@/components/PreviewDownload';
import SelectImage from '@/components/SelectImage';

export default function RemoveBg() {
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
  const [time, setTime] = useState('');
  const [wasmOnnxModel, setWasmOnnxModel] = useState(false);

  useEffect(() => {
    const model = window.localStorage.getItem(smallModelKey);
    setWasmOnnxModel(!!model);
  }, []);

  function changeModel() {
    const model = 'u2netp.onnx';
    window.localStorage.setItem(smallModelKey, model);
    window.location.reload();
  }

  const handleFiles = useCallback(async (imgFiles: File[]) => {
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
        <SelectImage onChange={handleFiles} />
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
