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

export interface FetcherConfig extends RequestConfig {
  baseURL?: string;
  transformRequest?: (data: any) => any;
  transformResponse?: (data: any) => any;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export interface UseHttpOptions<T = any> extends FetcherConfig {
  fallbackData?: T;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  dedupingInterval?: number;
  errorRetryCount?: number;
  shouldRetryOnError?: boolean | ((err: Error) => boolean);
  onErrorRetry?: (
    error: Error,
    key: string,
    config: any,
    revalidate: any,
    opts: any
  ) => void;
}

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
