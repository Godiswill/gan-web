import crypto from 'crypto';
import sodium from 'libsodium-wrappers';

const JWKS_URL = 'https://rest.alpha.fal.ai/.well-known/jwks.json';
const JWKS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let jwksCache: Array<{
  kty: string;
  crv: string;
  kid: string;
  x: string;
  use: string;
}>;
let jwksCacheTime = 0;

async function fetchJwks() {
  const currentTime = Date.now();
  if (!jwksCache || currentTime - jwksCacheTime > JWKS_CACHE_DURATION) {
    // const response = await fetch(JWKS_URL, { timeout: 10000 });
    const response = await fetchWithTimeout(JWKS_URL, {}, 10000);
    if (!response.ok) throw new Error(`JWKS fetch failed: ${response.status}`);
    jwksCache = (await response.json()).keys || [];
    jwksCacheTime = currentTime;
  }
  return jwksCache;
}

export default async function verifyWebhookSignature(
  requestId: string | null,
  userId: string | null,
  timestamp: string | null,
  signatureHex: string | null,
  body: Buffer | null
) {
  if (!requestId || !userId || !timestamp || !signatureHex || !body)
    return false;
  /*
   * Verify a webhook signature using provided headers and body.
   *
   * @param {string} requestId - Value of x-fal-webhook-request-id header.
   * @param {string} userId - Value of x-fal-webhook-user-id header.
   * @param {string} timestamp - Value of x-fal-webhook-timestamp header.
   * @param {string} signatureHex - Value of x-fal-webhook-signature header (hex-encoded).
   * @param {Buffer} body - Raw request body as a Buffer.
   * @returns {Promise<boolean>} True if the signature is valid, false otherwise.
   */
  await sodium.ready;

  // Validate timestamp (within ±5 minutes)
  try {
    const timestampInt = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - timestampInt) > 300) {
      console.error('Timestamp is too old or in the future.');
      return false;
    }
  } catch (e) {
    console.error('Invalid timestamp format:', e);
    return false;
  }

  // Construct the message to verify
  try {
    const messageParts = [
      requestId,
      userId,
      timestamp,
      crypto.createHash('sha256').update(body).digest('hex'),
    ];
    if (messageParts.some((part) => part == null)) {
      console.error('Missing required header value.');
      return false;
    }
    const messageToVerify = messageParts.join('\n');
    const messageBytes = Buffer.from(messageToVerify, 'utf-8');

    // Decode signature
    let signatureBytes;
    try {
      signatureBytes = Buffer.from(signatureHex, 'hex');
    } catch (e) {
      console.error('Invalid signature format (not hexadecimal).');
      return false;
    }

    // Fetch public keys
    let publicKeysInfo;
    try {
      publicKeysInfo = await fetchJwks();
      if (!publicKeysInfo.length) {
        console.error('No public keys found in JWKS.');
        return false;
      }
    } catch (e) {
      console.error('Error fetching JWKS:', e);
      return false;
    }

    // Verify signature with each public key
    for (const keyInfo of publicKeysInfo) {
      try {
        const publicKeyB64Url = keyInfo.x;
        if (typeof publicKeyB64Url !== 'string') continue;
        const publicKeyBytes = Buffer.from(publicKeyB64Url, 'base64url');
        const isValid = sodium.crypto_sign_verify_detached(
          signatureBytes,
          messageBytes,
          publicKeyBytes
        );
        if (isValid) return true;
      } catch (e) {
        console.error('Verification failed with a key:', e);
        continue;
      }
    }

    console.error('Signature verification failed with all keys.');
    return false;
  } catch (e) {
    console.error('Error constructing message:', e);
    return false;
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
