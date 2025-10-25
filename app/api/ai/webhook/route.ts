import { NextRequest } from 'next/server';
import verifyWebhookSignature from '@/lib/utils/falVerify';
import { ok, fail } from '@/lib/services/apiRes';
import { uploadToCloudFlare } from '../upload/util';

export async function POST(req: NextRequest) {
  try {
    // ✅ 1. 读取原始 body（raw bytes）
    const bodyArrayBuffer = await req.arrayBuffer();
    const bodyBuffer = Buffer.from(bodyArrayBuffer);

    // ✅ 2. 从 headers 取出 Fal 的签名信息
    const requestId = req.headers.get('X-Fal-Webhook-Request-Id');
    const userId = req.headers.get('X-Fal-Webhook-User-Id');
    const timestamp = req.headers.get('X-Fal-Webhook-Timestamp');
    const signatureHex = req.headers.get('X-Fal-Webhook-Signature');

    // ✅ 3. 验证签名
    const isValid = await verifyWebhookSignature(
      requestId,
      userId,
      timestamp,
      signatureHex,
      bodyBuffer
    );

    if (!isValid) {
      console.error('Fal webhook signature invalid!');
      return fail(500);
    }

    // ✅ 4. 验证通过后再安全解析 JSON
    const rst = JSON.parse(bodyBuffer.toString('utf-8'));

    // 在此处理业务逻辑，例如上传到 R2 或退回积分
    console.log('✅ Valid Fal webhook payload:', rst);
    if (rst.status === 'OK' && rst.payload !== null) {
      await uploadToCloudFlare(rst.payload.images[0], 'ai3');
    }

    return ok();
  } catch (e) {
    console.error('Webhook handler error:', e);
    return fail(500);
  }
}
