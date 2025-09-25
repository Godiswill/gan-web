'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useId } from 'react';
// import { CloudUploadIcon } from '@/components/svg';
import { CloudUploadIcon } from 'lucide-react';
import { exampleImgs, smallModelKey, inputId } from '@/lib/utils/const';

export default function SelectImage({
  onChange,
}: {
  onChange: (data: File[]) => void;
}) {
  const fileInputId = useId();
  // const fileInputId = useRef(`input-${crypto.randomUUID()}`).current;
  // const fileInputId = inputId;
  const dropRef = useRef<HTMLLabelElement>(null);

  function clearLocalStorage() {
    if (!!new URLSearchParams(window.location.search).get('debug')) {
      window.localStorage.removeItem(smallModelKey);
    }
  }

  const handleFiles = useCallback(
    async (files?: FileList | File[] | null) => {
      if (!files?.length) return;

      const imgFiles = Array.from(files).filter((it) =>
        it.type.startsWith('image/')
      );

      if (!imgFiles?.length) return;
      onChange([...files]);
    },
    [onChange]
  );

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

  return (
    <>
      <div className="glass-effect relative text-sm h-48 xs:h-56 sm:h-60 md:h-64 lg:h-72 xl:h-80 3xl:h-96 m-auto transition-[border-color]">
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
    </>
  );
}
