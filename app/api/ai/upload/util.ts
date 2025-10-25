import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { IMAGE_MAX_SIZE } from '@/lib/utils/const';
import { formatDateYYYYMMDD } from '@/lib/utils';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export type BucketType = 'tmp' | 'cdn' | 'ai3';

// 内部上传函数
export async function uploadToCloudFlare(
  file: File | string,
  bucket: BucketType
): Promise<string> {
  let fileName: string;
  let arrayBuffer: ArrayBuffer;
  let contentType: string;

  try {
    if (typeof file === 'string') {
      // 验证文件类型和大小
      const res = await fetch(file);
      if (!res.ok) {
        throw new Error('fetch remote file failed');
      }

      fileName = file.split('/').pop() || '';
      contentType =
        res.headers.get('content-type') || 'application/octet-stream';
      arrayBuffer = await res.arrayBuffer();
    } else {
      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
        throw new Error('只支持图片文件');
      }

      if (file.type.startsWith('image/') && file.size > IMAGE_MAX_SIZE) {
        throw new Error(`文件大小不能超过 ${IMAGE_MAX_SIZE / 1024 / 1024}MB`);
      }

      fileName = file.name;
      contentType = file.type;
      arrayBuffer = await file.arrayBuffer();
    }

    fileName = `${formatDateYYYYMMDD()}/${randomUUID().slice(
      0,
      8
    )}-${fileName}`;
    const buffer = Buffer.from(arrayBuffer);

    const command = {
      Bucket: bucket,
      Key: fileName,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
    };
    console.log(command);

    await r2.send(new PutObjectCommand(command));

    // 返回文件的公共访问 URL
    return `https://${bucket}.bgg.one/${fileName}`;
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
}
