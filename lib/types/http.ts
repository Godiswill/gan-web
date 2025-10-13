// -- swr --
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  credentials?: RequestCredentials;
  cache?: RequestCache;
}

export interface FetcherConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  transformRequest?: (data: any) => any;
  transformResponse?: (data: any) => any;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

// export interface UseHttpOptions<T = any> extends FetcherConfig {
//   fallbackData?: T;
//   revalidateOnFocus?: boolean;
//   revalidateOnReconnect?: boolean;
//   refreshInterval?: number;
//   dedupingInterval?: number;
//   errorRetryCount?: number;
//   shouldRetryOnError?: boolean | ((err: Error) => boolean);
//   onErrorRetry?: (
//     error: Error,
//     key: string,
//     config: any,
//     revalidate: any,
//     opts: any
//   ) => void;
// }

export class HttpError extends Error {
  status: number;
  info: any;

  constructor(message: string, status: number, info?: any) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.info = info;
  }
}

// -- api error --
export type ErrorStatus = 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503;
export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'AUTH_001'
  | 'AUTH_002'
  | 'AUTH_003'
  | 'BIZ_001'
  | 'BIZ_002'
  | 'BIZ_003'
  | 'BIZ_004'
  | 'SYS_001'
  | 'SYS_002'
  | 'DATA_001'
  | 'DATA_002';

export type ErrorCodeStatus = ErrorCode | ErrorStatus;

export type ApiResponse<T = any> = {
  success: boolean;
  code?: ErrorCodeStatus;
  data?: T;
  message?: string;
};

export interface ApiErrorResponse {
  code: ErrorCodeStatus;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  code: ErrorCodeStatus;
  status: ErrorStatus;
  details?: any;
  timestamp?: string;
  path?: string;

  constructor(
    message: string,
    code: ErrorCodeStatus,
    status: ErrorStatus,
    info?: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = info?.details;
    this.timestamp = info?.timestamp;
    this.path = info?.path;
  }
}

export type ErrorAction =
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
