import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { ok, fail } from '@/lib/services/api-response';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return fail(400, 'Invalid parameters', 400);
    }

    const fileUrl = await fal.storage.upload(file);

    return ok(fileUrl);
  } catch (error) {
    console.error('上传失败:', error);
    return fail(500, 'Internal Server Error', 500);
  }
}

// 内部上传函数
export async function uploadFileToFAL(file: File): Promise<string> {
  try {
    // 验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      throw new Error('只支持图片文件');
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB 限制
      throw new Error('文件大小不能超过 10MB');
    }

    // 上传文件到 FAL
    const fileUrl = await fal.storage.upload(file);
    return fileUrl;
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
}
