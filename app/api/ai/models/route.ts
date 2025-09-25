import { NextResponse } from 'next/server';

const AVAILABLE_MODELS = [
  {
    id: 'fal-ai/flux/dev',
    name: 'FLUX Dev',
    description: '高质量图片生成模型',
    type: 'text-to-image',
  },
  {
    id: 'fal-ai/flux/schnell',
    name: 'FLUX Schnell',
    description: '快速图片生成模型',
    type: 'text-to-image',
  },
  // 添加更多模型...
];

export async function GET() {
  return NextResponse.json({
    success: true,
    models: AVAILABLE_MODELS,
  });
}

export const MODELS_MAP = {
  v1: 'fal-ai/flux/dev',
  v2: 'fal-ai/flux/schnell',
  v3: 'custom-model/v3',
};