'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalErrorHandler } from '@/lib/utils/errorHandler';
import { toast } from 'sonner';

export default function ErrorHandlerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // 初始化全局错误处理器
    GlobalErrorHandler.getInstance({
      onRedirectLogin: () => {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      },
      onForceLogout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      },
      onRedirectRecharge: () => {
        router.push('/recharge');
      },
      onShowToast: (message, type) => {
        switch (type) {
          case 'success':
            toast.success(message);
            break;
          case 'error':
            toast.error(message);
            break;
          case 'warning':
            toast.warning(message);
            break;
          default:
            toast.info(message);
        }
      },
      enableToast: true,
      enableConsoleLog: process.env.NODE_ENV === 'development',
    });
  }, [router]);

  return <>{children}</>;
}
