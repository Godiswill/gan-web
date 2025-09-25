import { FetcherConfig, RequestConfig, HttpError } from '@/lib/types/swr';

// 通用 fetcher 函数
export const createFetcher = (defaultConfig: FetcherConfig = {}) => {
  const {
    baseURL = '',
    timeout = 10000,
    transformRequest,
    transformResponse,
    onError,
    onSuccess,
    ...defaultRequestConfig
  } = defaultConfig;

  return async (url: string, config: RequestConfig = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      ...requestConfig
    } = { ...defaultRequestConfig, ...config };

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
        ...requestConfig,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorInfo;
        try {
          errorInfo = await response.json();
        } catch {
          errorInfo = await response.text();
        }

        const error = new HttpError(
          `HTTP Error: ${response.status} ${response.statusText}`,
          response.status,
          errorInfo
        );

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

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new HttpError('Request timeout', 408);
          if (onError) onError(timeoutError);
          throw timeoutError;
        }
        if (onError) onError(error);
      }
      throw error;
    }
  };
};
