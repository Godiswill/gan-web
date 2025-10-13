import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import withAuth from '@/lib/services/withAuth';
import { ok, fail } from '@/lib/services/apiRes';
import { ModelId } from '@/lib/types';
import { MODELS_MAP } from '@/app/api/ai/models/route';
fal.config({
  credentials: process.env.FAL_KEY as string,
});

export const POST = withAuth(
  async (
    _req: NextRequest,
    ctx: RouteContext<'/api/ai/cancel/[modelId]/[requestId]'>
  ) => {
    const { modelId, requestId } = await ctx.params;
    const model = MODELS_MAP[modelId as ModelId];
    if (!model || !requestId) {
      return fail(400);
    }

    try {
      await fal.queue.cancel(model, {
        requestId,
      });
      return ok(undefined, 'mission cancelled');
    } catch (error) {
      console.error('取消任务失败:', error);
      return fail(500);
    }
  }
);
