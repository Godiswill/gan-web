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
export interface ApiErrorResponse {
  code: string | number;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  code: string | number;
  status: number;
  details?: any;
  timestamp?: string;
  path?: string;

  constructor(
    message: string,
    code: string | number,
    status: number,
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
