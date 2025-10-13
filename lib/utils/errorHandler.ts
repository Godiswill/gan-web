import { toast } from 'sonner';
import { ApiError, ErrorHandlerConfig } from '@/lib/types/http';
import { ERROR_CODE_MAP } from '@/lib/utils/const';

// 全局错误处理器
export class GlobalErrorHandler {
  private config: ErrorHandlerConfig;
  private static instance: GlobalErrorHandler;

  private constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      enableToast: true,
      enableConsoleLog: true,
      ...config,
    };
  }

  static getInstance(config?: ErrorHandlerConfig): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler(config);
    }
    return GlobalErrorHandler.instance;
  }

  updateConfig(config: Partial<ErrorHandlerConfig>) {
    this.config = { ...this.config, ...config };
  }

  handle(error: ApiError): void {
    const errorConfig =
      ERROR_CODE_MAP[error.code] || ERROR_CODE_MAP[error.status];

    if (this.config.enableConsoleLog) {
      console.error('API Error:', {
        code: error.code,
        status: error.status,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp,
        path: error.path,
      });
    }

    if (!errorConfig) {
      // 未知错误，使用默认处理
      this.showToast(error.message, 'error');
      return;
    }

    const message = errorConfig.message || error.message;

    // 根据动作类型执行相应操作
    switch (errorConfig.action) {
      case 'REDIRECT_LOGIN':
        this.handleRedirectLogin(message);
        break;

      case 'FORCE_LOGOUT':
        this.handleForceLogout(message);
        break;

      case 'REDIRECT_RECHARGE':
        this.handleRedirectRecharge(message);
        break;

      case 'SHOW_TOAST':
        this.showToast(message, errorConfig.toastType);
        break;

      case 'RETRY':
        this.showToast(message, errorConfig.toastType);
        // 重试逻辑由调用方处理
        break;

      case 'REFRESH_DATA':
        this.showToast(message, errorConfig.toastType);
        // 刷新逻辑由调用方处理
        break;

      case 'CUSTOM':
        if (this.config.onCustomError) {
          this.config.onCustomError(error);
        }
        break;

      default:
        this.showToast(message, 'error');
    }
  }

  private handleRedirectLogin(message: string) {
    this.showToast(message, 'warning');

    if (this.config.onRedirectLogin) {
      this.config.onRedirectLogin();
    } else {
      // 默认行为：跳转到登录页
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(
          currentPath
        )}`;
      }
    }
  }

  private handleForceLogout(message: string) {
    this.showToast(message, 'warning');

    if (this.config.onForceLogout) {
      this.config.onForceLogout();
    } else {
      // 默认行为：清除本地存储并跳转
      if (typeof window !== 'undefined') {
        // 清除认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  }

  private handleRedirectRecharge(message: string) {
    this.showToast(message, 'warning');

    if (this.config.onRedirectRecharge) {
      this.config.onRedirectRecharge();
    } else {
      // 默认行为：跳转到充值页
      if (typeof window !== 'undefined') {
        window.location.href = '/recharge';
      }
    }
  }

  private showToast(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) {
    if (!this.config.enableToast) return;

    if (this.config.onShowToast) {
      this.config.onShowToast(message, type);
    } else {
      // 默认使用 sonner toast
      if (typeof window !== 'undefined') {
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
      }
    }
  }
}
