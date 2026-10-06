/**
 * Cryptographically secure session token handling using Web Crypto API.
 * Works seamlessly in both Next.js Edge runtime (middleware) and Node.js route handlers.
 */

export const PREPSTREAK_SESSION_COOKIE = "prepstreak_session";

// Secret used to sign and verify HMAC tokens.
// In production, fallback to a deterministic system secret or env variable.
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  "prepstreak-ai-secure-hmac-sha256-key-2026";

export interface SessionPayload {
  userId: string;
  email: string;
  exp: number; // Unix timestamp in seconds
}

function base64UrlEncode(str: string): string {
  const base64 = typeof btoa === "function" 
    ? btoa(str) 
    : Buffer.from(str).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return typeof atob === "function" 
    ? atob(base64) 
    : Buffer.from(base64, "base64").toString("utf-8");
}

function base64UrlFromBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed session token: <base64url(payload)>.<base64url(signature)>
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const key = await getCryptoKey();
  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);

  const dataToSign = encoder.encode(encodedPayload);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
  const encodedSignature = base64UrlFromBuffer(signatureBuffer);

  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies a signed session token. Returns null if invalid or expired.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, encodedSignature] = parts;

  try {
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(encodedPayload);

    // Decode signature
    const signatureBinary = base64UrlDecode(encodedSignature);
    const signatureBytes = new Uint8Array(signatureBinary.length);
    for (let i = 0; i < signatureBinary.length; i++) {
      signatureBytes[i] = signatureBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      dataToVerify
    );

    if (!isValid) return null;

    const payloadStr = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadStr);

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSeconds) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
