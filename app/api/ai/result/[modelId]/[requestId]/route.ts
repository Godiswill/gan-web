import { NextRequest } from 'next/server';
import { fal } from '@fal-ai/client';
import withAuth from '@/lib/services/withAuth';
import { ok, fail } from '@/lib/services/apiRes';
import { MODELS_MAP } from '@/app/api/ai/models/route';
import { ModelId } from '@/lib/types';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export const GET = withAuth(
  async (
    req: NextRequest,
    ctx: RouteContext<'/api/ai/result/[modelId]/[requestId]'>
  ) => {
    const { searchParams } = new URL(req.url);
    const isMock = !!searchParams.get('mock');

    const { modelId, requestId } = await ctx.params;
    const model = MODELS_MAP[modelId as ModelId];
    if (!model || !requestId) {
      return fail(400);
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
      return fail(500);
    }
  }
);
