import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { uploadFileToFAL } from '../upload/route';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 从 FormData 中提取参数
    const prompt = formData.get('prompt') as string;
    const referenceImage = formData.get('referenceImage') as File | null;
    const model = (formData.get('model') as string) || 'fal-ai/flux/dev';
    const width = parseInt((formData.get('width') as string) || '1024');
    const height = parseInt((formData.get('height') as string) || '1024');
    const num_inference_steps = parseInt(
      (formData.get('num_inference_steps') as string) || '28'
    );
    const guidance_scale = parseFloat(
      (formData.get('guidance_scale') as string) || '3.5'
    );
    const seed = formData.get('seed')
      ? parseInt(formData.get('seed') as string)
      : undefined;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: '请提供 prompt' }, { status: 400 });
    }

    let image_url: string | undefined;

    // 如果有参考图片，先上传
    if (referenceImage && referenceImage.size > 0) {
      try {
        console.log('正在上传参考图片...');
        image_url = await uploadFileToFAL(referenceImage);
        console.log('参考图片上传成功:', image_url);
      } catch (error) {
        console.error('参考图片上传失败:', error);
        return NextResponse.json(
          {
            error: `参考图片上传失败: ${
              error instanceof Error ? error.message : '未知错误'
            }`,
          },
          { status: 400 }
        );
      }
    }

    // 提交异步任务，立即返回任务ID
    const { request_id } = await fal.queue.submit(model, {
      input: {
        prompt: prompt.trim(),
        image_url,
        width,
        height,
        num_inference_steps,
        guidance_scale,
        seed,
      },
    });

    return NextResponse.json({
      success: true,
      request_id,
      model, // 返回模型信息，供后续查询使用
      uploaded_reference: !!image_url, // 告诉前端是否成功上传了参考图片
    });
  } catch (error) {
    console.error('提交任务失败:', error);

    let errorMessage = '提交任务失败，请重试';
    if (error instanceof Error && error.message.includes('上传')) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
