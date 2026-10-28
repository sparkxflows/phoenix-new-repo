import { send } from '../lib/http.js';
import { SUPABASE_URL, HAS_SUPABASE, ANON_KEY, GEMINI_API_KEY, UPLOAD_BUCKET } from '../lib/env.js';

/**
 * GET /api/health — quick self-check after deploying.
 * Visit https://your-site.vercel.app/api/health to see what is wired up.
 */
export default async function handler(req: any, res: any) {
  let database: Record<string, any> = { reachable: false };

  if (HAS_SUPABASE) {
    try {
      const probe = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=key&limit=1`, {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
        },
      });
      database = {
        reachable: probe.ok,
        status: probe.status,
        detail: probe.ok ? 'site_settings table reachable' : await probe.text().catch(() => ''),
      };
    } catch (err: any) {
      database = { reachable: false, detail: err?.message || 'network error' };
    }
  }

  send(res, 200, {
    success: true,
    service: 'phoenix-tattooz-api',
    runtime: 'vercel-serverless',
    time: new Date().toISOString(),
    config: {
      supabaseUrl: SUPABASE_URL || null,
      serviceRoleKey: HAS_SUPABASE ? 'present' : 'MISSING',
      publicKey: ANON_KEY ? 'present' : 'MISSING',
      geminiApiKey: GEMINI_API_KEY ? 'present' : 'missing (chatbot will use the built-in knowledge base)',
      uploadBucket: UPLOAD_BUCKET,
    },
    database,
    nextStep: HAS_SUPABASE
      ? database.reachable
        ? 'All good — bookings, members, CMS and uploads are live.'
        : 'Key present but the database call failed. Run supabase-schema.sql in the SQL Editor.'
      : 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel → Environment Variables, then redeploy.',
  });
}
