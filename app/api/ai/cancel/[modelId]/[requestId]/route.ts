import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { ok, fail } from '@/lib/services/api-response';
import { FalQueueParams, ModelId } from '@/lib/types';
import { MODELS_MAP } from '@/app/api/ai/models/route';
fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<FalQueueParams> }
) {
  const { modelId, requestId } = await context.params;
  const model = MODELS_MAP[modelId as ModelId];
  if (!model || !requestId) {
    return fail(400, 'Invalid parameters', 400);
  }

  try {
    await fal.queue.cancel(model, {
      requestId,
    });
    return ok(undefined, 'mission cancelled');
  } catch (error) {
    console.error('取消任务失败:', error);
    return fail(500, 'Internal Server Error', 500);
  }
}
