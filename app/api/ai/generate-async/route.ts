import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { ok, fail } from '@/lib/services/api-response';
import { ModelId } from '@/lib/types/fal';
import { uploadFileToFAL } from '../upload/route';
import { MODELS_MAP } from '../models/route';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 从 FormData 中提取参数
    const modelId = formData.get('modelId') as ModelId;
    const model = MODELS_MAP[modelId];
    const prompt = (formData.get('prompt') as string)?.trim();
    const images = formData.getAll('files') as File[] | null;
    // const width = parseInt((formData.get('width') as string) || '1024');
    // const height = parseInt((formData.get('height') as string) || '1024');
    // const num_inference_steps = parseInt(
    //   (formData.get('num_inference_steps') as string) || '28'
    // );
    // const guidance_scale = parseFloat(
    //   (formData.get('guidance_scale') as string) || '3.5'
    // );
    // const seed = formData.get('seed')
    //   ? parseInt(formData.get('seed') as string)
    //   : undefined;

    if (!model) {
      return fail(400, 'Invalid parameters', 400);
    }

    if (!prompt) {
      return fail(400, 'Invalid parameters', 400);
    }

    let image_urls: string[] = [];
    console.log(images);
    // 如果有参考图片，先上传
    if (images && images.length > 0) {
      for (const img of images) {
        // 图片不能为空
        if (img.size <= 0) {
          return fail(400, 'Invalid parameters', 400);
        }
        // 单张图片不能超过 5MB
        if (img.size > 5 * 1024 * 1024) {
          return fail(400, 'Invalid parameters', 400);
        }
      }
      try {
        console.log('正在上传参考图片...');
        for (const img of images) {
          const image_url = await uploadFileToFAL(img);
          console.log('参考图片上传成功:', image_url);
          image_urls.push(image_url);
        }
      } catch (error) {
        console.error('参考图片上传失败:', error);
        return fail(400, 'Upload error', 400);
      }
    }

    if (!image_urls.length) {
      return fail(400, 'Invalid parameters', 400);
    }

    // 提交异步任务，立即返回任务ID
    const { request_id } = await fal.queue.submit(model, {
      input: {
        prompt,
        image_urls,
        // width,
        // height,
        // num_inference_steps,
        // guidance_scale,
        // seed,
      },
    });

    return ok({
      request_id,
      model_id: modelId,
    });
  } catch (error) {
    console.error('提交任务失败:', error);

    return fail(500, 'Internal Server Error', 500);
  }
}
