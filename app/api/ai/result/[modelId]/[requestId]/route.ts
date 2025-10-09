import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { ok, fail } from '@/lib/services/api-response';
import { MODELS_MAP } from '@/app/api/ai/models/route';
import { FalQueueParams, ModelId } from '@/lib/types';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<FalQueueParams> }
) {
  const { searchParams } = new URL(request.url);
  const isMock = !!searchParams.get('mock');

  const { modelId, requestId } = await context.params;
  const model = MODELS_MAP[modelId as ModelId];
  if (!model || !requestId) {
    return fail(400, 'Invalid parameters', 400);
  }

  if (isMock) {
    return ok({
      images: [
        {
          url: 'https://v3b.fal.media/files/b/zebra/YgbpBc91qKsaoST0BXMxM.jpg',
          content_type: 'image/jpeg',
          file_name: 'output.jpeg',
          file_size: null,
        },
      ],
      description: '',
    });
  }

  try {
    const result = await fal.queue.result(model, {
      requestId,
    });
    return ok(result?.data);
  } catch (error) {
    console.error('获取结果失败:', error);
    return fail(500, 'Internal Server Error', 500);
  }
}
