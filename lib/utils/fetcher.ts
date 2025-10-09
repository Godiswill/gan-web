import {
  FetcherConfig,
  RequestConfig,
  ApiError,
  ApiErrorResponse,
} from '@/lib/types/swr';
import { GlobalErrorHandler } from '@/lib/utils/errorHandler';

// 通用 fetcher 函数
export const createFetcher = (
  fetcherConfig: FetcherConfig = {},
  requestConfig: RequestConfig = {}
) => {
  const {
    baseURL = '',
    timeout = 10000,
    transformRequest,
    transformResponse,
    onError,
    onSuccess,
  } = fetcherConfig;

  const errorHandler = GlobalErrorHandler.getInstance();

  const isMock = true; // 全局 mock 开关

  return async (url: string, config: RequestConfig = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      ...restConfig
    } = { ...requestConfig, ...config };

    // 构建完整 URL
    let fullUrl = baseURL + url;

    // 处理查询参数
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      fullUrl += `?${searchParams.toString()}`;
    }

    if (isMock) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + 'mock=true';
    }

    // 处理请求体
    let processedBody = body;
    if (body && transformRequest) {
      processedBody = transformRequest(body);
    } else if (
      body &&
      typeof body === 'object' &&
      !(body instanceof FormData)
    ) {
      processedBody = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: processedBody,
        signal: controller.signal,
        ...restConfig,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorInfo: ApiErrorResponse;

        try {
          errorInfo = await response.json();
        } catch {
          // 如果解析 JSON 失败，使用默认错误信息
          errorInfo = {
            code: response.status,
            message: response.statusText || 'Unknown error',
          };
        }

        // 创建 ApiError 实例
        const error = new ApiError(
          errorInfo.message || `HTTP Error: ${response.status}`,
          errorInfo.code || response.status,
          response.status,
          errorInfo
        );

        // 使用全局错误处理器
        errorHandler.handle(error);

        // 调用自定义错误处理
        if (onError) onError(error);

        throw error;
      }

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      // 响应数据转换
      const result = transformResponse ? transformResponse(data) : data;

      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new ApiError('Request timeout', 'TIMEOUT', 408);
          errorHandler.handle(timeoutError);
          if (onError) onError(timeoutError);
          throw timeoutError;
        }

        // 网络错误
        const networkError = new ApiError('Network error', 'NETWORK_ERROR', 0);
        errorHandler.handle(networkError);
        if (onError) onError(networkError);
        throw networkError;
      }

      throw error;
    }
  };
};
