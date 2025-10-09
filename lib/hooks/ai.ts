import { useState, useCallback } from 'react';
import { usePost, useGet } from './http';
import {
  FalUploadResponse,
  FalGenerateRequest,
  FalGenerateResponse,
  FalAsyncResponse,
  FalStatusResponse,
  FalResultResponse,
  FalError,
  ModelId,
} from '../types/fal';

// 文件上传 Hook
export function useFalUpload() {
  const { trigger, data, error, isMutating } = usePost<
    FalUploadResponse,
    FormData
  >('/api/ai/upload', {
    headers: {}, // 让浏览器自动设置 multipart/form-data
    transformRequest: (data) => data, // 保持 FormData 原样
    onError: (error) => {
      console.error('File upload failed:', error);
    },
  });

  const uploadFile = useCallback(
    async (file: File): Promise<FalUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      return await trigger(formData);
    },
    [trigger]
  );

  return {
    uploadFile,
    data,
    error: error as FalError | undefined,
    isUploading: isMutating,
  };
}

// 将请求数据转换为 FormData（如果包含文件）
const prepareRequestData = (
  params: FalGenerateRequest
): FormData | FalGenerateRequest => {
  const { files, ...otherParams } = params;

  // 如果没有文件，直接返回 JSON 数据
  if (!files?.length) {
    return params;
  }

  // 如果有文件，使用 FormData
  const formData = new FormData();

  // 添加文件
  files?.forEach((file) => formData.append('files', file));

  // 添加其他参数
  Object.entries(otherParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(
        key,
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      );
    }
  });

  return formData;
};

// 同步生成 Hook（支持文件上传）
export function useFalGenerate() {
  const { trigger, data, error, isMutating } = usePost<
    FalGenerateResponse,
    FormData | FalGenerateRequest
  >('/api/ai/generate', {
    transformRequest: (data) => data, // 保持数据原样，让浏览器处理
    onSuccess: (data) => {
      console.log('Generation completed:', data);
    },
    onError: (error) => {
      console.error('Generation failed:', error);
    },
  });

  const generate = useCallback(
    async (params: FalGenerateRequest): Promise<FalGenerateResponse> => {
      const requestData = prepareRequestData(params);
      return await trigger(requestData);
    },
    [trigger]
  );

  return {
    generate,
    data,
    error: error as FalError | undefined,
    isGenerating: isMutating,
  };
}

// 异步生成 Hook（支持文件上传）
export function useFalGenerateAsync() {
  const { trigger, data, error, isMutating } = usePost<
    FalAsyncResponse,
    FormData | FalGenerateRequest
  >('/api/ai/generate-async', {
    transformRequest: (data) => data, // 保持数据原样
    onSuccess: (data) => {
      console.log('Async generation started:', data.request_id);
    },
    onError: (error) => {
      console.error('Async generation failed:', error);
    },
  });

  const generateAsync = useCallback(
    async (params: FalGenerateRequest): Promise<FalAsyncResponse> => {
      const requestData = prepareRequestData(params);
      return await trigger(requestData);
    },
    [trigger]
  );

  return {
    generateAsync,
    data,
    error: error as FalError | undefined,
    isSubmitting: isMutating,
  };
}

// 状态查询 Hook
export function useFalStatus(
  modelId: ModelId | null,
  requestId: string | null,
  options?: {
    refreshInterval?: number;
    shouldStop?: (status: string) => boolean;
  }
) {
  const {
    refreshInterval = 0, // 默认不轮询
    shouldStop = (status: string) => ['COMPLETED', 'FAILED'].includes(status),
  } = options || {};

  const { data, error, isLoading, mutate } = useGet<FalStatusResponse>(
    modelId && requestId ? `/api/ai/status/${modelId}/${requestId}` : null,
    {
      refreshInterval,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        if (shouldStop(data.data.status)) {
          // mutate(data, false);
        }
      },
    }
  );
  return {
    inferenceTime: data?.data?.metrics?.inference_time,
    status: data?.data?.status,
    logs: data?.data?.logs,
    isLoading,
    error: error as FalError | undefined,
    refresh: mutate,
  };
}

// 结果获取 Hook
export function useFalResult(
  modelId: ModelId | null,
  requestId: string | null
) {
  const { data, error, isLoading, mutate } = useGet<FalResultResponse>(
    modelId && requestId ? `/api/ai/result/${modelId}/${requestId}` : null,
    // '/api/ai/result/v0/90a02a75-cc85-490b-9183-98f2c3480bbd',
    {
      revalidateOnFocus: false,
      errorRetryCount: 1, // 只重试一次
    }
  );

  console.log({
    result: data,
    isLoading,
    error: error as FalError | undefined,
    refresh: mutate,
  });

  return {
    result: data,
    isLoading,
    error: error as FalError | undefined,
    refresh: mutate,
  };
}

// 完整的异步生成流程 Hook
export function useFalAsyncGeneration() {
  const [modelId, setModelId] = useState<ModelId | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const {
    generateAsync,
    isSubmitting,
    error: submitError,
  } = useFalGenerateAsync();
  const {
    inferenceTime,
    status,
    logs,
    error: statusError,
  } = useFalStatus(modelId, requestId, {
    refreshInterval: isComplete ? 0 : 2000, // 完成后停止轮询
    shouldStop: (status) => {
      const isDone = ['COMPLETED', 'FAILED'].includes(status);
      if (isDone) {
        setIsComplete(true);
      }
      return isDone;
    },
  });
  const isSuccess = isComplete && status === 'COMPLETED';
  const {
    result,
    error: resultError,
    isLoading,
  } = useFalResult(isSuccess ? modelId : null, isSuccess ? requestId : null);

  const reset = useCallback(() => {
    setModelId(null);
    setRequestId(null);
    setIsComplete(false);
  }, []);

  const generate = useCallback(
    async (params: FalGenerateRequest) => {
      reset();
      try {
        const response = await generateAsync(params);
        setModelId(response?.data?.model_id ?? null);
        setRequestId(response?.data?.request_id ?? null);
        return response;
      } catch (error) {
        console.error('Failed to start generation:', error);
        throw error;
      }
    },
    [generateAsync, reset]
  );

  const isInProgress = !!requestId && !isComplete;
  return {
    generate,
    reset,
    requestId,
    status,
    logs,
    result,
    isSubmitting,
    isInProgress,
    isLoading: isSubmitting || isInProgress || isLoading,
    inferenceTime,
    error: submitError || statusError || resultError,
  };
}
