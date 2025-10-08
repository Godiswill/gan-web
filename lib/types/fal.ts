// -- fal --
export type ModelId = 'v0' | 'v1' | 'v2' | 'v3';

export type FalQueueParams = {
  modelId: string | ModelId;
  requestId: string;
};

export interface FalUploadResponse {
  file_url: string;
  file_name: string;
  content_type: string;
}

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

export interface FalGenerateResponse {
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
}

export interface FalAsyncResponse {
  model_id: ModelId;
  request_id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

export interface FalStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  logs?: Array<{
    message: string;
    level: string;
    timestamp: string;
  }>;
}

export interface FalResultResponse extends FalGenerateResponse {
  request_id: string;
}

export interface FalError {
  error: string;
  detail?: string;
}
