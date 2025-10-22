import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { fal } from '@fal-ai/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import withAuth from '@/lib/services/withAuth';
import { ok, fail } from '@/lib/services/apiRes';
import { IMAGE_MAX_SIZE } from '@/lib/utils/const';
import { formatDateYYYYMMDD } from '@/lib/utils';

fal.config({
  credentials: process.env.FAL_KEY as string,
});

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return fail(400);
    }

    const fileUrl = await uploadFileCloudFlare(file);

    return ok(fileUrl);
  } catch (error) {
    console.error('上传失败:', error);
    return fail(500);
  }
});

// 内部上传函数
export async function uploadFileToFAL(file: File): Promise<string> {
  try {
    // 验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      throw new Error('只支持图片文件');
    }

    if (file.size > IMAGE_MAX_SIZE) {
      throw new Error(`文件大小不能超过 ${IMAGE_MAX_SIZE / 1024 / 1024}MB`);
    }

    // 上传文件到 FAL
    const fileUrl = await fal.storage.upload(file);
    return fileUrl;
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
}

// 内部上传函数
export async function uploadFileCloudFlare(file: File): Promise<string> {
  try {
    // 验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      throw new Error('只支持图片文件');
    }

    if (file.size > IMAGE_MAX_SIZE) {
      throw new Error(`文件大小不能超过 ${IMAGE_MAX_SIZE / 1024 / 1024}MB`);
    }

    // 读取文件为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到 Cloudflare R2
    const fileName = `${formatDateYYYYMMDD()}/${randomUUID().slice(0, 8)}-${
      file.name
    }`;

    const command = {
      Bucket: process.env.R2_TMP_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };
    console.log(command);

    await r2.send(new PutObjectCommand(command));

    // 返回文件的公共访问 URL
    return `https://${process.env.R2_TMP_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
}
