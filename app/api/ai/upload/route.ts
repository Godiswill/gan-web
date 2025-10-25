import { NextRequest } from 'next/server';
import withAuth from '@/lib/services/withAuth';
import { ok, fail } from '@/lib/services/apiRes';
import { uploadToCloudFlare, BucketType } from './util';

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const bucket = (formData.get('bucket') as BucketType) || 'tmp';
    const file = formData.get('file') as File;

    if (!file) {
      return fail(400);
    }

    const fileUrl = await uploadToCloudFlare(file, bucket);

    return ok(fileUrl);
  } catch (error) {
    console.error('上传失败:', error);
    return fail(500);
  }
});
