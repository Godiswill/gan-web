import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { MODELS_MAP } from '@/app/api/ai/models/route';
import { ModelId } from '@/lib/types';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { model: ModelId; requestId: string } }
) {
  try {
    const { model, requestId } = params;

    // 从查询参数获取模型名，如果没有则使用默认值
    // const { searchParams } = new URL(request.url);
    // const model = searchParams.get('model') || 'fal-ai/flux/dev';

    const status = await fal.queue.status(MODELS_MAP[model], {
      requestId: requestId,
      logs: true,
    });

    return NextResponse.json({
      success: true,
      status: status.status,
      // queue_position: status.queue_position,
      // logs: status.logs || [],
    });
  } catch (error) {
    console.error('查询状态失败:', error);
    return NextResponse.json({ error: '查询状态失败' }, { status: 500 });
  }
}
