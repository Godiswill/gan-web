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
      status: Math.random() < 0.5 ? 'COMPLETED' : 'IN_PROGRESS',
      request_id: 'b04c0332-2f9f-46d7-93b6-43ba09ef7df7',
      response_url: null,
      status_url: null,
      cancel_url: null,
      logs: [],
      metrics: {
        inference_time: 12.7048718929291,
      },
    });
  }

  try {
    const result = await fal.queue.status(model, {
      requestId,
      logs: true,
    });

    return ok({
      ...result,
      response_url: null,
      status_url: null,
      cancel_url: null,
    });
  } catch (error) {
    console.error('查询状态失败:', error);
    return fail(500, 'Internal Server Error', 500);
  }
}
