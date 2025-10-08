import React, { useState, useEffect, useCallback } from 'react';
import {
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  // RotateCwIcon,
  DownloadIcon,
  EyeIcon,
} from 'lucide-react';

export default function ImagePreview({
  src = '',
  alt = '',
  width = '100%',
  height = '100%',
  preview = true,
  fallback = '/404',
  className = '',
  ...props
}) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const openPreview = useCallback(() => {
    if (preview && !imageError) {
      setIsPreviewVisible(true);
      setScale(1);
      setRotation(0);
      setDragPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    }
  }, [preview, imageError]);

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false);
    document.body.style.overflow = 'unset';
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.5, 0.5));
  }, []);

  // const rotate = () => {
  //   setRotation((prev) => (prev + 90) % 360);
  // };

  const download = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  }, [src, alt]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - dragPosition.x,
        y: e.clientY - dragPosition.y,
      });
    }
  };

  const preD = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleWheel = (e: React.WheelEvent) => {
    // debugger;
    // e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  useEffect(() => {
    if (isPreviewVisible) {
      const handleMouseMove = (e: globalThis.MouseEvent) => {
        if (isDragging && scale > 1) {
          setDragPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          });
        }
      };
      const handleMouseUp = () => {
        setIsDragging(false);
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPreviewVisible, isDragging, dragStart]);

  const currentSrc = imageError ? fallback : src;

  return (
    <>
      {/* 主图片 */}
      <div
        className={`relative inline-block ${className}`}
        style={{ width, height }}
      >
        <img
          src={`${currentSrc}`}
          alt={alt}
          // onLoad={handleImageLoad}
          onError={handleImageError}
          className={`
            w-full h-full object-cover rounded-lg 
            ${
              preview && imageError
                ? 'cursor-pointer hover:opacity-80 transition-opacity'
                : ''
            }
          `}
          // className={`
          //   w-full h-full object-cover rounded-lg
          //   ${
          //     preview && imageError
          //       ? 'cursor-pointer hover:opacity-80 transition-opacity'
          //       : ''
          //   }
          //   ${!imageLoaded ? 'animate-pulse bg-gray-200' : ''}
          // `}
          onClick={openPreview}
          {...props}
        />

        {/* 预览图标覆盖层 */}
        {preview && !imageError && imageLoaded && (
          <div
            className="absolute inset-0 bg-black hover:bg-black/20
                     flex items-center justify-center opacity-0 hover:opacity-100 
                     transition-all duration-200 cursor-pointer rounded-lg"
            onClick={openPreview}
          >
            <EyeIcon className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      {/* 预览模态框 */}
      {isPreviewVisible && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && closePreview()}
        >
          {/* 预览图片 */}
          <div className="relative max-w-full max-h-full" onWheel={handleWheel}>
            <img
              src={currentSrc}
              alt={alt}
              className={`
                max-w-none transition-transform duration-200 select-none
                ${scale > 1 ? 'cursor-grab' : 'cursor-default'}
                ${isDragging ? 'cursor-grabbing' : ''}
              `}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${
                  dragPosition.x / scale
                }px, ${dragPosition.y / scale}px)`,
                maxWidth: scale <= 1 ? '90vw' : 'none',
                maxHeight: scale <= 1 ? '90vh' : 'none',
              }}
              onMouseDown={handleMouseDown}
              onDragStart={preD}
            />
          </div>

          {/* 工具栏 */}
          <div
            className="absolute top-4 right-4 flex items-center gap-2 bg-black bg-opacity-50 
                        rounded-lg p-2 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={zoomOut}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
              disabled={scale <= 0.5}
            >
              <ZoomOutIcon className="w-5 h-5" />
            </button>

            <span className="text-white text-sm px-2">
              {Math.round(scale * 100)}%
            </span>

            <button
              type="button"
              onClick={zoomIn}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
              disabled={scale >= 5}
            >
              <ZoomInIcon className="w-5 h-5" />
            </button>

            {/* <button
              type="button"
              onClick={rotate}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              <RotateCw className="w-5 h-5" />
            </button> */}

            <button
              type="button"
              onClick={download}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={closePreview}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 底部信息栏 */}
          {alt && (
            <div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                          bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              {alt}
            </div>
          )}
        </div>
      )}
    </>
  );
}
