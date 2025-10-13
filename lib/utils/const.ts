import { ErrorCodeStatus, ErrorAction } from '@/lib/types/http';

export const exampleImgs = [
  { src: '/images/car.jpg', alt: 'Car | AI Background Remover - BgGone' },
  { src: '/images/dog.jpg', alt: 'Pet | AI Background Removal - BgGone' },
  { src: '/images/eagle.jpg', alt: 'Animal | AI Remove Background - BgGone' },
  {
    src: '/images/love.jpg',
    alt: 'People | AI Remove the Background of people - BgGone',
  },
  { src: '/images/motorcycle.jpg', alt: 'Sports | AI Remove Bg - BgGone' },
];

export const smallModelKey = 'WasmOnnxModel';

export const inputId = 'input-select-img';

export const IMAGE_SIZES = [
  { label: 'Landscape 4:3 (1024×768)', value: 'landscape_4_3' },
  { label: 'Landscape 16:9 (1024×576)', value: 'landscape_16_9' },
  { label: 'Square 1:1 (512×512)', value: 'square' },
  { label: 'Square HD 1:1 (1024×1024)', value: 'square_hd' },
  { label: 'Portrait 3:4 (768×1024)', value: 'portrait_4_3' },
  { label: 'Portrait 9:16 (576×1024)', value: 'portrait_16_9' },
];

export const OUTPUT_FORMATS = [
  { label: 'PNG', value: 'png' },
  { label: 'JPEG', value: 'jpeg' },
];

export const NUMBER_OF_IMAGES = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
];

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES = 5;

// 错误码映射配置
export const ERROR_CODE_MAP: Record<
  ErrorCodeStatus,
  {
    message: string;
    action: ErrorAction;
    toastType: 'success' | 'error' | 'warning' | 'info';
  }
> = {
  TIMEOUT: {
    message: 'Request timeout',
    action: 'SHOW_TOAST',
    toastType: 'error',
  },
  NETWORK_ERROR: {
    message: 'Network error',
    action: 'SHOW_TOAST',
    toastType: 'error',
  },
  // 认证相关错误, (401、403 按通用来，不做额外)
  AUTH_001: {
    message: '账号已在其他地方登录',
    action: 'FORCE_LOGOUT',
    toastType: 'warning',
  },
  AUTH_002: {
    message: 'todo',
    action: 'REDIRECT_LOGIN',
    toastType: 'warning',
  },
  AUTH_003: {
    message: 'todo',
    action: 'SHOW_TOAST',
    toastType: 'error',
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
  BIZ_004: {
    message: 'Upload err',
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
  400: {
    message: 'Bad Request, Invalid parameters',
    action: 'SHOW_TOAST',
    toastType: 'error',
  },
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
    message: 'Internal Server Error',
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
