import { send, methodNotAllowed } from '../lib/http.js';

/** GET /api/app-info — heartbeat used by the admin dashboard. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  send(res, 200, {
    success: true,
    status: 'online',
    runtime: 'vercel-serverless',
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
  });
}
