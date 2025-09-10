'use client';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function DebugMobile() {
  const [isDebug, setIsDebug] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isDebug =
      (!!params.get('debug') || window.location.protocol !== 'https:') &&
      /mobile/i.test(navigator.userAgent);
    setIsDebug(isDebug);
  }, []);

  return isDebug ? <Script src="/eruda.js" /> : null;
}
