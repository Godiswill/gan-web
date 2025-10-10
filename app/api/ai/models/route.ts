import { NextResponse } from 'next/server';
import { ok } from '@/lib/services/api-response';

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
  return ok(AVAILABLE_MODELS);
}

export const MODELS_MAP = {
  v0: 'fal-ai/nano-banana',
  v1: 'fal-ai/nano-banana/edit',
  v2: 'fal-ai/flux/dev',
  v3: 'fal-ai/flux/schnell',
  g0: 'fal-ai/gemini-25-flash-image',
  g1: 'fal-ai/gemini-25-flash-image/edit',
};
