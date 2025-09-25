import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation from 'swr/mutation';
import { UseHttpOptions, RequestConfig, HttpError } from '@/lib/types/swr';
import { createFetcher } from '@/lib/utils/fetcher';

// 默认 fetcher
const defaultFetcher = createFetcher({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// GET 请求 hook
export function useGet<T = any>(
  url: string | null,
  options: UseHttpOptions<T> = {}
) {
  const {
    fallbackData,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval,
    dedupingInterval = 2000,
    errorRetryCount = 3,
    shouldRetryOnError = true,
    onErrorRetry,
    ...fetcherConfig
  } = options;

  const fetcher = createFetcher(fetcherConfig);

  const swrConfig: SWRConfiguration = {
    fallbackData,
    revalidateOnFocus,
    revalidateOnReconnect,
    refreshInterval,
    dedupingInterval,
    errorRetryCount,
    shouldRetryOnError,
    onErrorRetry,
  };

  return useSWR<T>(
    url ? [url, 'GET'] : null,
    ([url]) => fetcher(url, { method: 'GET' }),
    swrConfig
  );
}

// POST 请求 hook
export function usePost<T = any, K = any>(
  url: string,
  options: UseHttpOptions<T> = {}
) {
  const fetcher = createFetcher(options);

  return useSWRMutation<T, Error, string, K>(
    url,
    (url, { arg }: { arg: K }) =>
      fetcher(url, {
        method: 'POST',
        body: arg,
      }),
    {
      revalidate: false,
      ...options,
    }
  );
}

// PUT 请求 hook
export function usePut<T = any, K = any>(
  url: string,
  options: UseHttpOptions<T> = {}
) {
  const fetcher = createFetcher(options);

  return useSWRMutation<T, Error, string, K>(
    url,
    (url, { arg }: { arg: K }) =>
      fetcher(url, {
        method: 'PUT',
        body: arg,
      }),
    {
      revalidate: false,
      ...options,
    }
  );
}

// DELETE 请求 hook
export function useDelete<T = any>(
  url: string,
  options: UseHttpOptions<T> = {}
) {
  const fetcher = createFetcher(options);

  return useSWRMutation<T, Error, string, void>(
    url,
    (url) => fetcher(url, { method: 'DELETE' }),
    {
      revalidate: false,
      ...options,
    }
  );
}

// PATCH 请求 hook
export function usePatch<T = any, K = any>(
  url: string,
  options: UseHttpOptions<T> = {}
) {
  const fetcher = createFetcher(options);

  return useSWRMutation<T, Error, string, K>(
    url,
    (url, { arg }: { arg: K }) =>
      fetcher(url, {
        method: 'PATCH',
        body: arg,
      }),
    {
      revalidate: false,
      ...options,
    }
  );
}

// 通用 HTTP hook
export function useHttp<T = any, K = any>(
  url: string | null,
  config: RequestConfig & UseHttpOptions<T> = {}
) {
  const { method = 'GET', ...options } = config;
  const fetcher = createFetcher(options);

  if (method === 'GET') {
    return useSWR<T>(
      url ? [url, method] : null,
      ([url]) => fetcher(url, { method }),
      options
    );
  }

  return useSWRMutation<T, Error, string, K>(
    url || '',
    (url, { arg }: { arg?: K }) =>
      fetcher(url, {
        method,
        body: arg,
      }),
    {
      revalidate: false,
      ...options,
    }
  );
}

// 实用工具 hooks
export function useApiWithAuth<T = any>(
  url: string | null,
  token?: string,
  options: UseHttpOptions<T> = {}
) {
  return useGet<T>(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

export function usePagination<T = any>(
  url: string,
  page: number = 1,
  pageSize: number = 10,
  options: UseHttpOptions<T> = {}
) {
  return useGet<T>(`${url}`, {
    ...options,
    params: {
      page,
      pageSize,
      ...(options.params || {}),
    },
  });
}

// 使用示例
// export const examples = {
//   // GET 请求示例
//   getUserExample: () => {
//     const { data, error, isLoading, mutate } = useGet<{
//       id: number;
//       name: string;
//     }>('/users/1', {
//       fallbackData: null,
//       revalidateOnFocus: false,
//     });

//     return { data, error, isLoading, mutate };
//   },

//   // POST 请求示例
//   createUserExample: () => {
//     const { trigger, data, error, isMutating } = usePost<
//       { id: number; name: string },
//       { name: string; email: string }
//     >('/users', {
//       onSuccess: (data) => console.log('User created:', data),
//       onError: (error) => console.error('Failed to create user:', error),
//     });

//     const handleCreateUser = async () => {
//       try {
//         const result = await trigger({
//           name: 'John',
//           email: 'john@example.com',
//         });
//         console.log('Created:', result);
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     };

//     return { trigger: handleCreateUser, data, error, isMutating };
//   },

//   // 带认证的请求示例
//   getProtectedDataExample: (token: string) => {
//     const { data, error, isLoading } = useApiWithAuth<{ sensitive: string }>(
//       '/protected-data',
//       token,
//       {
//         errorRetryCount: 1,
//         shouldRetryOnError: (err) =>
//           err instanceof HttpError && err.status !== 401,
//       }
//     );

//     return { data, error, isLoading };
//   },

//   // 分页请求示例
//   getUsersListExample: (page: number) => {
//     const { data, error, isLoading } = usePagination<{
//       users: Array<{ id: number; name: string }>;
//       total: number;
//     }>('/users', page, 10, {
//       refreshInterval: 30000, // 30秒自动刷新
//     });

//     return { data, error, isLoading };
//   },

//   // 文件上传示例
//   uploadFileExample: () => {
//     const { trigger, data, error, isMutating } = usePost<
//       { fileId: string; url: string },
//       FormData
//     >('/upload', {
//       transformRequest: (data) => data, // 保持 FormData 原样
//       headers: {}, // 让浏览器自动设置 Content-Type
//     });

//     const handleUpload = async (file: File) => {
//       const formData = new FormData();
//       formData.append('file', file);

//       try {
//         const result = await trigger(formData);
//         console.log('Upload result:', result);
//       } catch (error) {
//         console.error('Upload failed:', error);
//       }
//     };

//     return { handleUpload, data, error, isMutating };
//   },
// };

// 全局配置示例
export const setupGlobalConfig = () => {
  return createFetcher({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
    transformResponse: (data) => {
      // 全局响应数据转换
      if (data && typeof data === 'object' && 'data' in data) {
        return data.data;
      }
      return data;
    },
    onError: (error) => {
      // 全局错误处理
      if (error instanceof HttpError && error.status === 401) {
        // 处理认证失败
        window.location.href = '/login';
      }
    },
  });
};
