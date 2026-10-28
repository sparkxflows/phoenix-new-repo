/**
 * Small helpers shared by every serverless endpoint.
 */

export const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export function readBody(req: any): any {
  if (req?.body && typeof req.body === 'object') return req.body;
  if (typeof req?.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

/** Collects a raw request body (used by the binary upload endpoints). */
export async function readRawBody(req: any): Promise<Buffer> {
  if (Buffer.isBuffer(req?.body) && req.body.length > 0) return req.body;

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve());
    req.on('error', reject);
  });
  return Buffer.concat(chunks);
}

export function send(res: any, status: number, payload: any): void {
  res.status(status).setHeader('Content-Type', JSON_HEADERS['Content-Type']);
  res.setHeader('Cache-Control', JSON_HEADERS['Cache-Control']);
  res.send(JSON.stringify(payload));
}

export function methodNotAllowed(res: any, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  send(res, 405, { success: false, error: `Method not allowed. Use ${allowed.join(' or ')}.` });
}

export function serverError(res: any, err: any, fallback: string): void {
  const message = err?.message || fallback;
  console.error(`[api] ${fallback}:`, message);
  send(res, 500, {
    success: false,
    error: message,
    hint: /not configured/i.test(message)
      ? 'Vercel → Settings → Environment Variables me SUPABASE_URL aur SUPABASE_SERVICE_ROLE_KEY add karo, phir Redeploy karo.'
      : undefined,
  });
}
