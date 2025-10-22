import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { ok, fail } from '@/lib/services/apiRes';
import withAuth from '@/lib/services/withAuth';
import { ModelId } from '@/lib/types/fal';
import { uploadFileCloudFlare } from '../upload/route';
import { MODELS_MAP } from '../models/route';
import { MAX_FILES, IMAGE_MAX_SIZE } from '@/lib/utils/const';
import { mockDelay } from '@/lib/utils';
import promptMap, { PromptsKey } from '@/lib/db/prompt';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export const POST = withAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const isMock = !!searchParams.get('mock');
  const contentType = req.headers.get('content-type');

  let modelId: ModelId;
  let prompt: string;
  let images: File[];
  try {
    if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData();
      // 从 FormData 请求
      modelId = (formData.get('modelId') as ModelId) || 'g1';
      prompt = (formData.get('prompt') as string)?.trim();
      prompt = promptMap[prompt as PromptsKey]?.prompt || prompt;
      images = (formData.getAll('files') as File[])?.slice(0, MAX_FILES);
    } else {
      // 无文件发送的是 JSON 请求
      const data = await req.json();
      modelId = data.modelId || 'g0';
      prompt = (data.prompt as string)?.trim();
      images = [];
    }

    let model = MODELS_MAP[modelId];

    // 如果传了 modelId，但不在列表中，报错
    if (modelId && !model) {
      return fail(400);
    }

    if (!prompt) {
      return fail(400);
    }
    console.log('prompt: ', prompt);

    let image_urls: string[] = [];
    console.log(images);
    // 如果有参考图片，先上传
    if (images && images.length > 0) {
      for (const img of images) {
        // 图片不能为空
        if (img.size <= 0) {
          return fail(400);
        }
        // 单张图片不能超过 5MB
        if (img.size > IMAGE_MAX_SIZE) {
          return fail(400);
        }
      }
      image_urls = [];
      try {
        console.log('正在上传参考图片...');
        for (const img of images) {
          // if (isMock) {
          //   image_urls.push('https://via.placeholder.com/512');
          //   continue;
          // }
          const image_url = await uploadFileCloudFlare(img);
          console.log('参考图片上传成功:', image_url);
          image_urls.push(image_url);
        }
      } catch (error) {
        console.error('参考图片上传失败:', error);
        return fail(400, 'BIZ_004');
      }
    }

    if (['v1', 'g1'].includes(modelId) && !image_urls.length) {
      return fail(400);
    }

    if (isMock) {
      mockDelay();
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

    return fail(500);
  }
});
