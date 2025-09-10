'use client';

import { useRef, useEffect } from 'react';

export default function ImgCompareSlider({
  beforeSrc,
  afterSrc,
  processing,
  onClose,
}: {
  beforeSrc?: string;
  afterSrc?: string;
  processing?: boolean;
  onClose: () => void;
}) {
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgBeforeRef = useRef<HTMLImageElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const showAfter = !processing && afterSrc;

  useEffect(() => {
    if (!showAfter) return;

    const imgContainer = imgContainerRef.current;
    const imgBefore = imgBeforeRef.current;
    const slider = sliderRef.current;

    if (!imgContainer || !imgBefore || !slider) return;

    function touchmoveEvent(e: TouchEvent) {
      if (!imgContainer || !imgBefore || !slider) return;

      const containerWidth = imgContainer.offsetWidth;
      const currentPoint = e.changedTouches[0].clientX;

      const startOfDiv = imgContainer.offsetLeft;

      const modifiedCurrentPoint = currentPoint - startOfDiv;

      const leftPercent = (modifiedCurrentPoint * 100) / containerWidth;
      const rightPercent = 100 - leftPercent;

      imgBefore.setAttribute(
        'style',
        `clip-path: inset(0 ${rightPercent}% 0 0);`
      );
      slider.setAttribute('style', 'left:' + leftPercent + '%;');
    }

    imgContainer.addEventListener('touchmove', touchmoveEvent, {
      passive: true,
    });

    function mousemoveEvent(e: MouseEvent) {
      if (!imgContainer || !imgBefore || !slider) return;

      const containerWidth = imgContainer.offsetWidth;
      const leftPercent = (e.offsetX * 100) / containerWidth;
      const rightPercent = 100 - leftPercent;

      // if (e.offsetX > 10 && e.offsetX < containerWidth - 10) {
      imgBefore.setAttribute(
        'style',
        `clip-path: inset(0 ${rightPercent}% 0 0);`
      );
      slider.setAttribute('style', 'left:' + leftPercent + '%;');
      // }
    }
    imgContainer.addEventListener('mousemove', mousemoveEvent);

    return () => {
      imgContainer.removeEventListener('touchmove', touchmoveEvent);
      imgContainer.removeEventListener('mousemove', mousemoveEvent);
    };
  }, [showAfter]);

  return (
    <div
      className="h-50 relative cursor-grab overflow-hidden"
      ref={imgContainerRef}
    >
      {showAfter ? (
        <>
          <img
            className="w-full h-full object-cover"
            style={{
              backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                            linear-gradient(-45deg, #ccc 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #ccc 75%),
                            linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
              backgroundSize: `20px 20px`,
              backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`,
            }}
            src={afterSrc}
            alt="After | BgGone - Free AI Background Remover"
          />
          <div
            ref={sliderRef}
            className="bg-white/20 backdrop-blur-md
            h-11 w-11 absolute z-1 left-1/2 top-1/2 ml-[-22px] mt-[-22px] border-2 border-white rounded-full 
            shadow-[0 0 10px rgb(12, 12, 12)] pointer-events-none 
            before:content-[' '] before:block before:w-0.5 before:bg-white before:h-[9999px] before:absolute before:left-1/2 before:ml-[-1px] before:bottom-1/2 before:mb-[22px] before:shadow-[0 0 10px rgb(12, 12, 12)]
            after:content-[' '] after:block after:w-0.5 after:bg-white after:h-[9999px] after:absolute after:left-1/2 after:ml-[-1px] after:top-1/2 after:mt-[22px] after:shadow-[0 0 5px rgb(12, 12, 12)]
        "
          >
            <span className="w-0 h-0 border-6 border-solid border-transparent absolute top-1/2 -mt-[6px] border-r-white left-1/2 ml-[-17px]"></span>
            <span className="w-0 h-0 border-6 border-solid border-transparent absolute top-1/2 -mt-[6px] border-l-white right-1/2 mr-[-17px]"></span>
          </div>
        </>
      ) : null}

      <img
        ref={imgBeforeRef}
        className="w-full h-full object-cover absolute top-0"
        src={beforeSrc}
        style={{
          clipPath: afterSrc ? `inset(0 50% 0 0)` : 'inset(0 0 0 0)',
        }}
        alt="Before | BgGone - Free AI Background Remover"
      />

      {processing ? (
        <div
          className={`absolute inset-0 bg-black/50 items-center justify-center flex`}
        >
          <div className="text-white text-center">
            <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
            <p>Processing...</p>
          </div>
        </div>
      ) : (
        <div className="absolute top-3 right-3">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
