import { ApiResponse } from './http';

// -- fal --
export type ModelId = 'v0' | 'v1' | 'v2' | 'v3' | 'g0' | 'g1';

export type FalStatusResponse = ApiResponse<{
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  request_id: string;
  response_url: string | null;
  status_url: string | null;
  cancel_url: string | null;
  metrics: {
    inference_time: number;
  };
  logs?: Array<{
    message: string;
    level: string;
    timestamp: string;
  }>;
}>;

export type FalUploadResponse = ApiResponse<string>;

export type FalAsyncResponse = ApiResponse<{
  model_id: ModelId;
  request_id: string;
  // status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}>;

// 21:9, 1:1, 4:3, 3:2, 2:3, 5:4, 4:5, 3:4, 16:9, 9:16
enum AspectRatio {
  '21:9' = '21:9',
  '1:1' = '1:1',
  '4:3' = '4:3',
  '3:2' = '3:2',
  '2:3' = '2:3',
  '5:4' = '5:4',
  '4:5' = '4:5',
  '3:4' = '3:4',
  '16:9' = '16:9',
  '9:16' = '9:16',
}

export interface NanoBananaRequest {
  modelId: ModelId;
  prompt: string;
  files?: File[];
  image_urls: string[];
  num_images?: number;
  output_format?: 'jpeg' | 'png';
  sync_mode?: boolean;
  aspect_ratio?:
    | '21:9'
    | '1:1'
    | '4:3'
    | '3:2'
    | '2:3'
    | '5:4'
    | '4:5'
    | '3:4'
    | '16:9'
    | '9:16';
  [key: string]: any;
}

export interface FluxRequest {
  modelId: ModelId;
  prompt: string;
  image_size?:
    | 'square_hd'
    | 'square'
    | 'portrait_4_3'
    | 'portrait_16_9'
    | 'landscape_4_3'
    | 'landscape_16_9';
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  seed?: number;
  expand_prompt?: boolean;
  format?: 'jpeg' | 'png';
  // 文件相关参数 - 后端会处理文件上传
  files?: File[]; // 用于 img2img 等需要输入图片的场景
  mask_file?: File; // 用于 inpainting 等需要遮罩的场景
  [key: string]: any; // 允许其他参数
}

export type FalGenerateRequest = NanoBananaRequest | FluxRequest;

export type FluxResultResponse = ApiResponse<{
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings: {
    inference: number;
  };
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}>;

export type NanoBananaResultResponse = ApiResponse<{
  images: Array<{
    url: string;
    content_type: string;
    file_name: string;
    file_size: number | null;
  }>;
  description: string;
}>;

export type FalGenerateResponse = FluxResultResponse | NanoBananaResultResponse;

export type FalResultResponse = FalGenerateResponse;

export interface FalError {
  error: string;
  detail?: string;
}
