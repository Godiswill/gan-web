import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImageWithSkeleton({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // 检查图片是否已经加载完成（缓存的情况）
    if (img.complete && img.naturalHeight !== 0) {
      setLoaded(true);
    }
  }, [src]); // 当 src 变化时重新检查

  // useLayoutEffect 在浏览器绘制前同步执行
  // useLayoutEffect(() => {
  //   const img = imgRef.current;
  //   if (img?.complete && img.naturalHeight !== 0) {
  //     setLoaded(true);
  //   } else {
  //     setLoaded(false);
  //   }
  // }, [src]);

  return (
    <Skeleton
      className={clsx('overflow-hidden', className, { 'animate-none': loaded })}
    >
      <img
        ref={imgRef}
        crossOrigin="anonymous"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
      />
    </Skeleton>
  );
}
