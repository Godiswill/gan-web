import { ApiError } from '@/lib/types/swr';
import { toast } from 'sonner';

// 错误码映射配置
export const ERROR_CODE_MAP: Record<
  string | number,
  {
    message: string;
    action: ErrorAction;
    toastType: 'success' | 'error' | 'warning' | 'info';
  }
> = {
  // 认证相关错误
  AUTH_001: {
    message: '登录已过期，请重新登录',
    action: 'REDIRECT_LOGIN',
    toastType: 'warning',
  },
  AUTH_002: {
    message: '无权限访问此资源',
    action: 'SHOW_TOAST',
    toastType: 'error',
  },
  AUTH_003: {
    message: '账号已在其他地方登录',
    action: 'FORCE_LOGOUT',
    toastType: 'warning',
  },

  // 业务相关错误
  BIZ_001: {
    message: '余额不足',
    action: 'REDIRECT_RECHARGE',
    toastType: 'warning',
  },
  BIZ_002: {
    message: '操作过于频繁，请稍后再试',
    action: 'SHOW_TOAST',
    toastType: 'warning',
  },
  BIZ_003: {
    message: '文件大小超过限制',
    action: 'SHOW_TOAST',
    toastType: 'error',
  },

  // 系统相关错误
  SYS_001: {
    message: '服务暂时不可用',
    action: 'RETRY',
    toastType: 'error',
  },
  SYS_002: {
    message: '网络连接异常',
    action: 'RETRY',
    toastType: 'error',
  },

  // 数据相关错误
  DATA_001: {
    message: '数据不存在',
    action: 'SHOW_TOAST',
    toastType: 'error',
  },
  DATA_002: {
    message: '数据已过期',
    action: 'REFRESH_DATA',
    toastType: 'warning',
  },

  // HTTP 状态码映射
  401: {
    message: '未授权，请先登录',
    action: 'REDIRECT_LOGIN',
    toastType: 'warning',
  },
  403: {
    message: '无权限访问',
    action: 'SHOW_TOAST',
    toastType: 'error',
  },
  404: {
    message: '请求的资源不存在',
    action: 'SHOW_TOAST',
    toastType: 'error',
  },
  429: {
    message: '请求过于频繁',
    action: 'SHOW_TOAST',
    toastType: 'warning',
  },
  500: {
    message: '服务器错误',
    action: 'SHOW_TOAST',
    toastType: 'error',
  },
  502: {
    message: '网关错误',
    action: 'RETRY',
    toastType: 'error',
  },
  503: {
    message: '服务暂时不可用',
    action: 'RETRY',
    toastType: 'error',
  },
} as const;

type ErrorAction =
  | 'SHOW_TOAST' // 显示 toast 提示
  | 'REDIRECT_LOGIN' // 重定向到登录页
  | 'FORCE_LOGOUT' // 强制登出
  | 'REDIRECT_RECHARGE' // 重定向到充值页
  | 'RETRY' // 重试请求
  | 'REFRESH_DATA' // 刷新数据
  | 'CUSTOM'; // 自定义处理

// 错误处理器配置
export interface ErrorHandlerConfig {
  onRedirectLogin?: () => void;
  onForceLogout?: () => void;
  onRedirectRecharge?: () => void;
  onShowToast?: (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) => void;
  onCustomError?: (error: ApiError) => void;
  enableToast?: boolean;
  enableConsoleLog?: boolean;
}

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
