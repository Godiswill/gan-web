'use client';

import { useEffect, useState } from 'react';
import ImgCompareSlider from './ImgCompareSlider';
import ImgModal from './ImgModal';
import FileSaver from 'file-saver';

export interface IPreviewDownloadProps {
  beforeFile: Blob & { name: string };
  afterFile?: Blob & { name: string };
  processing: boolean;
  className?: string;
  onClose: () => void;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function PreviewDownload({
  beforeFile,
  afterFile,
  className,
  processing,
  onClose,
}: IPreviewDownloadProps) {
  const [beforeSrc, setBeforeSrc] = useState<string>();
  const [afterSrc, setAfterSrc] = useState<string>();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  function preview() {
    setShow(true);
  }

  async function copyFile() {
    if (!afterFile) return;

    const clipboardItem = new ClipboardItem({
      [afterFile.type]: afterFile,
    });
    await navigator.clipboard.write([clipboardItem]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    console.log('good');
  }

  async function saveFile() {
    if (!afterFile) return;

    FileSaver.saveAs(afterFile, afterFile.name);
  }

  useEffect(() => {
    const url = URL.createObjectURL(beforeFile);
    setBeforeSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [beforeFile]);

  useEffect(() => {
    if (!afterFile) return;

    const url = URL.createObjectURL(afterFile);
    setAfterSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [afterFile]);
  return (
    <div
      className={`glass-effect ${processing ? 'processing' : ''} ${className}`}
    >
      <ImgCompareSlider
        beforeSrc={beforeSrc}
        afterSrc={afterSrc}
        processing={processing}
        onClose={onClose}
      />
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 truncate">
          {beforeFile.name}
        </h3>
        <p className="text-black/80 dark:text-white/80 text-xs mb-3 flex justify-between">
          <span>{formatFileSize(beforeFile.size)}</span>
          {afterFile?.size && (
            <span>After: {formatFileSize(afterFile.size)}</span>
          )}
        </p>
        <div className="flex gap-8">
          <button
            onClick={preview}
            // className="flex-1 px-3 py-2 rounded-lg text-sm/6 font-semibold text-gray-950 ring-1 ring-gray-950/10 hover:ring-gray-950/20  transition-all"
            className="flex-1 px-3 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition-all"
          >
            Preview
          </button>
          {!!afterSrc && (
            <>
              <button
                onClick={copyFile}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-all"
              >
                {copied ? '✅ Copied!' : 'Copy'}
              </button>
              <button
                onClick={saveFile}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
      {beforeSrc && (
        <ImgModal
          isVisible={show}
          url={afterSrc || beforeSrc}
          onClose={() => setShow(false)}
        />
      )}
    </div>
  );
}
