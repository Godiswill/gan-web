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

    const result = await fal.queue.result(MODELS_MAP[model], {
      requestId: requestId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取结果失败:', error);
    return NextResponse.json({ error: '获取结果失败' }, { status: 500 });
  }
}
