'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
// import { toast } from 'sonner';
import { ImageUp, ImagePlus, Trash2Icon } from 'lucide-react';
import clsx from 'clsx';
import { formatFileSize, getImageDimensions } from '@/lib/utils';
// import { checkImage } from '@/lib/utils';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import ImagePreview from '@/components/ImagePreview';
import { ImageFilesInfo } from '@/lib/types';
import { de } from 'zod/v4/locales';

export default function SelectImage2({
  value: files,
  onChange,
}: {
  value?: ImageFilesInfo;
  onChange?: (files: ImageFilesInfo) => void;
}) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  // const [url, setUrl] = useState<string>();
  const [isDragOver, setIsDragOver] = useState(false);
  // const [files, setFiles] = useState<File[]>();

  // const checkUrl = async () => {
  //   if (!url) return;
  //   const rst = await checkImage(url);
  //   if (!rst) {
  //     toast('Invalid URL');
  //   }
  // };

  const handleFiles = useCallback(
    async (files?: FileList | File[] | null) => {
      if (!files?.length) return;

      const imgFiles = Array.from(files).filter((it) =>
        it.type.startsWith('image/')
      );

      const imgFilesInfo: ImageFilesInfo = [];
      for (let file of imgFiles) {
        if (!file.type.startsWith('image/')) continue;
        const { width, height } = await getImageDimensions(file);
        imgFilesInfo.push({ file, width, height });
      }

      if (!imgFilesInfo?.length) return;
      // setFiles(imgFiles);
      onChange?.(imgFilesInfo);
      console.log(imgFilesInfo);
    },
    [onChange]
  );

  function dragOverEvent(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function dragLeaveEvent(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function dropEvent(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    handleFiles(files);
  }

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

  const [fileList, setFileList] =
    useState<{ file: File; url: string; size: number; px: string }[]>();
  useEffect(() => {
    const urlList = files?.map(({ file, width, height }) => ({
      file,
      url: URL.createObjectURL(file),
      size: file.size,
      px: `${width}x${height}`,
    }));
    setFileList(urlList);

    return () => {
      urlList?.map(({ url }) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const deleteImg = (file: File) => {
    onChange?.(files?.filter((it) => it.file !== file) || []);
  };

  const triggerInputFile = () => {
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
      inputFileRef.current.click();
    }
  };

  return (
    <div
      className="relative"
      onDragOver={dragOverEvent}
      onDragLeave={dragLeaveEvent}
      onDrop={dropEvent}
    >
      {/* <div className="flex gap-2 mb-4">
        <Button variant="outline" onClick={() => inputFileRef.current?.click()}>
          <ImagePlus size={16} /> Add Image
        </Button>
        <input
          ref={inputFileRef}
          type="file"
          accept="image/*"
          multiple
          className="opacity-0 h-0 w-0 hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Input
          placeholder="Add image from URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button variant="outline" disabled={!url} onClick={checkUrl}>
          Add URL
        </Button>
      </div> */}
      {/* <p className="text-sm text-muted-foreground text-content-light">
        Hint: Drag and drop files from your computer, images from web pages,
        paste from clipboard (Ctrl/Cmd+V), or provide a URL.
      </p> */}
      <input
        ref={inputFileRef}
        type="file"
        accept="image/*"
        multiple
        className="opacity-0 h-0 w-0 hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        className="flex flex-col items-center rounded border py-4 cursor-pointer transition-all
 hover:border-2 hover:border-dashed hover:border-primary"
        onClick={triggerInputFile}
      >
        <ImageUp size={30} strokeWidth={1} />
        <div className="text-center text-sm md:text-xs">
          <p className="mt-2">Click</p>
          <p className="my-1">Drag & Drop</p>
          <p>Paste Image (Ctrl+V/Cmd+V)</p>
        </div>
      </div>
      {!!fileList?.length && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4">
          {fileList?.map(({ file, url, size, px }) => (
            <div
              key={url}
              className="relative group flex aspect-square items-center justify-center rounded border"
            >
              <img
                src={url}
                alt="your image"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 hidden group-hover:block"></div>
              <button
                onClick={() => deleteImg(file)}
                className="absolute top-1 right-1 p-2 text-white hover:bg-white/20 rounded transition-colors"
                type="button"
              >
                <Trash2Icon size={16} />
              </button>
              <div className="absolute flex justify-between rounded p-1 left-1 right-1 bottom-1 text-xs text-primary-foreground group-hover:bg-white/20">
                <div className="mr-2">{px}</div>
                <div>{formatFileSize(size)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div
        className={clsx([
          'absolute -inset-1 flex items-center justify-center text-primary-foreground backdrop-blur-xs',
          'bg-black/50 dark:bg-white/10 ',
          isDragOver ? 'block' : 'hidden',
        ])}
      >
        drop image here...
      </div>
    </div>
  );
}
