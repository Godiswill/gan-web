import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { uploadFileToFAL } from '../upload/route';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

// 设置较长的超时时间（5分钟）
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 从 FormData 中提取参数
    const prompt = formData.get('prompt') as string;
    const referenceImage = formData.get('referenceImage') as File | null;
    const model = (formData.get('model') as string) || 'fal-ai/flux/dev';
    const width = parseInt((formData.get('width') as string) || '1024');
    const height = parseInt((formData.get('height') as string) || '1024');
    const num_inference_steps = parseInt((formData.get('num_inference_steps') as string) || '28');
    const guidance_scale = parseFloat((formData.get('guidance_scale') as string) || '3.5');
    const seed = formData.get('seed') ? parseInt(formData.get('seed') as string) : undefined;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: '请提供 prompt' },
        { status: 400 }
      );
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
          { error: `参考图片上传失败: ${error instanceof Error ? error.message : '未知错误'}` },
          { status: 400 }
        );
      }
    }

    // 使用 Promise.race 实现自定义超时控制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('请求超时，请稍后重试'));
      }, 280000); // 4分40秒超时，留给 Vercel 20秒缓冲
    });

    const generatePromise = fal.subscribe(model, {
      input: {
        prompt: prompt.trim(),
        image_url,
        width,
        height,
        num_inference_steps,
        guidance_scale,
        seed
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    // 竞赛超时和生成任务
    const result = await Promise.race([generatePromise, timeoutPromise]);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('生成失败:', error);
    
    // 根据错误类型返回不同信息
    let errorMessage = '生成失败，请重试';
    if (error instanceof Error) {
      if (error.message.includes('超时')) {
        errorMessage = '生成时间过长，请稍后重试或简化提示词';
      } else if (error.message.includes('queue')) {
        errorMessage = '服务器繁忙，请稍后重试';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API 配额不足，请联系管理员';
      } else if (error.message.includes('上传')) {
        errorMessage = error.message; // 直接返回上传错误信息
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}