import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;

    // 从请求体获取模型名
    const body = await request.json();
    const model = body.model || 'fal-ai/flux/dev';

    // 修正：第一个参数是模型名，requestId 在第二个参数的对象中
    await fal.queue.cancel(model, {
      requestId: requestId,
    });

    return NextResponse.json({
      success: true,
      message: '任务已取消',
    });
  } catch (error) {
    console.error('取消任务失败:', error);
    return NextResponse.json({ error: '取消任务失败' }, { status: 500 });
  }
}
