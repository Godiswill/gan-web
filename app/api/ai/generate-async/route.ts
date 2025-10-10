import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { ok, fail } from '@/lib/services/api-response';
import { ModelId } from '@/lib/types/fal';
import { uploadFileToFAL } from '../upload/route';
import { MODELS_MAP } from '../models/route';
import { MAX_FILES, IMAGE_MAX_SIZE } from '@/lib/utils/const';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isMock = !!searchParams.get('mock');
  const contentType = request.headers.get('content-type');

  let modelId: ModelId;
  let prompt: string;
  let images: File[];
  try {
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      // 从 FormData 请求
      modelId = (formData.get('modelId') as ModelId) || 'g1';
      prompt = (formData.get('prompt') as string)?.trim();
      images = (formData.getAll('files') as File[])?.slice(0, MAX_FILES);
    } else {
      // 无文件发送的是 JSON 请求
      const data = await request.json();
      modelId = data.modelId || 'g0';
      prompt = (data.prompt as string)?.trim();
      images = [];
    }

    let model = MODELS_MAP[modelId];

    // 如果传了 modelId，但不在列表中，报错
    if (modelId && !model) {
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
        if (img.size > IMAGE_MAX_SIZE) {
          return fail(400, 'Invalid parameters', 400);
        }
      }
      image_urls = [];
      try {
        console.log('正在上传参考图片...');
        for (const img of images) {
          if (isMock) {
            image_urls.push('https://via.placeholder.com/512');
            continue;
          }
          const image_url = await uploadFileToFAL(img);
          console.log('参考图片上传成功:', image_url);
          image_urls.push(image_url);
        }
      } catch (error) {
        console.error('参考图片上传失败:', error);
        return fail(400, 'Upload error', 400);
      }
    }

    if (['v1', 'g1'].includes(modelId) && !image_urls.length) {
      return fail(400, 'Invalid parameters', 400);
    }

    if (isMock) {
      return ok({
        request_id: 'mock-request-id',
        model_id: modelId,
      });
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
