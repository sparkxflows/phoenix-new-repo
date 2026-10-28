/**
 * Local runner for the Vercel serverless API layer.
 *
 *   npm run api:dev      → http://localhost:4000/api/health
 *
 * Lets you exercise the exact same handlers Vercel deploys without leaving your
 * machine. The main Express app (npm start, port 3000) is untouched.
 */
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '100mb' }));



// Vercel ships a single catch-all function on the Hobby plan, so the local
// runner mounts the same router instead of one route per endpoint.
const router = (await import('../api/[...all].js')).default;

app.all('/api/*', async (req: any, res: any) => {
  // Mirror Vercel: expose the catch-all segments on req.query.all
  const segments = String(req.originalUrl || req.url)
    .split('?')[0]
    .replace(/^\/api\/?/, '')
    .split('/')
    .filter(Boolean);
  req.query = { ...(req.query || {}), all: segments };
  try {
    await router(req, res);
  } catch (err: any) {
    console.error('[api:dev] router crashed', err);
    if (!res.headersSent) res.status(500).json({ success: false, error: err?.message || 'handler crashed' });
  }
});

const PORT = Number(process.env.API_PORT) || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Phoenix Tattooz — Vercel API layer running`);
  console.log(`  http://localhost:${PORT}/api/health\n`);
});
