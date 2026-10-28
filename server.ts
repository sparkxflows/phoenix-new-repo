import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'studio_store.json');
const STORE_BACKUP_FILE = path.join(DATA_DIR, 'studio_store.backup.json');

// Resilient in-memory & file-backed store for studio content
interface StudioStoreData {
  version: number;
  updatedAt: string;
  customer_reviews: any[];
  custom_artists: any[];
  custom_gallery: any[];
  custom_videos: any[];
  home_hero: any;
  about_settings: any;
  studio_philosophy: any;
  custom_logo: any;
  admin_user: any | null;
  member_users: any[];
  member_activity_log?: any[];
  [key: string]: any;
}

const DEFAULT_STORE: StudioStoreData = {
  version: Date.now(),
  updatedAt: new Date().toISOString(),
  customer_reviews: [],
  custom_artists: [],
  custom_gallery: [],
  custom_videos: [],
  home_hero: null,
  about_settings: null,
  studio_philosophy: null,
  custom_logo: null,
  admin_user: null,
  member_users: [],
  member_activity_log: [],
  appointments: [],
  contact_inquiries: [],
  site_settings: {},
};

let inMemoryStore: StudioStoreData = { ...DEFAULT_STORE };
let initialDefaultReviews: any[] = [];

function initStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let loadedData: any = null;

    // 1. Try reading primary store file
    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        if (raw && raw.trim().length > 0) {
          loadedData = JSON.parse(raw);
        }
      } catch (readErr) {
        console.warn('[StudioStorage] Primary store corrupted, attempting backup recovery:', readErr);
      }
    }

    // 2. Fault-tolerant automatic recovery from backup file if primary is missing/corrupted
    if (!loadedData && fs.existsSync(STORE_BACKUP_FILE)) {
      try {
        const backupRaw = fs.readFileSync(STORE_BACKUP_FILE, 'utf-8');
        if (backupRaw && backupRaw.trim().length > 0) {
          loadedData = JSON.parse(backupRaw);
          console.log('[StudioStorage] Successfully recovered data from backup!');
        }
      } catch (backupErr) {
        console.error('[StudioStorage] Backup read error:', backupErr);
      }
    }

    if (loadedData) {
      inMemoryStore = {
        ...DEFAULT_STORE,
        ...loadedData,
      };
      if (Array.isArray(inMemoryStore.customer_reviews)) {
        initialDefaultReviews = [...inMemoryStore.customer_reviews];
      }
      // Re-save backup to ensure synchronization
      if (!fs.existsSync(STORE_BACKUP_FILE)) {
        persistStore();
      }
    } else {
      inMemoryStore = {
        ...DEFAULT_STORE,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
      };
      persistStore();
    }
  } catch (err) {
    console.warn('[StudioStorage] Error initializing store from disk, using memory fallback:', err);
    inMemoryStore = { ...DEFAULT_STORE };
  }
}

function persistStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const serialized = JSON.stringify(inMemoryStore, null, 2);
    const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    fs.renameSync(tempFile, STORE_FILE);

    // Automated synchronized backup
    fs.writeFileSync(STORE_BACKUP_FILE, serialized, 'utf-8');
  } catch (err) {
    console.error('[StudioStorage] Error writing store file:', err);
  }
}

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
const DATA_UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_UPLOADS_DIR)) {
  fs.mkdirSync(DATA_UPLOADS_DIR, { recursive: true });
}

initStore();

const studioStorage = {
  getAppInfo() {
    return {
      version: inMemoryStore.version,
      updatedAt: inMemoryStore.updatedAt,
      timestamp: Date.now(),
    };
  },

  getAll() {
    return { ...inMemoryStore };
  },

  getValue(key: string) {
    if (key === 'home_hero' || key === 'custom_home_hero') {
      return inMemoryStore.home_hero || inMemoryStore.custom_home_hero || null;
    }
    return inMemoryStore[key] ?? null;
  },

  setValue(key: string, value: any) {
    inMemoryStore[key] = value;
    if (key === 'home_hero') {
      inMemoryStore['custom_home_hero'] = value;
    } else if (key === 'custom_home_hero') {
      inMemoryStore['home_hero'] = value;
    }
    inMemoryStore.updatedAt = new Date().toISOString();
    inMemoryStore.version = Date.now();
    persistStore();
    return {
      success: true,
      key,
      updatedAt: inMemoryStore.updatedAt,
      version: inMemoryStore.version,
    };
  },

  syncReviewsIfMore(clientReviews: any[]) {
    if (!Array.isArray(clientReviews) || clientReviews.length === 0) {
      return inMemoryStore.customer_reviews;
    }
    const current = inMemoryStore.customer_reviews || [];
    const hasNewIds = clientReviews.some(
      (cr) => !current.some((sr) => sr.id === cr.id)
    );
    const hasDifferentApproved = clientReviews.some((cr) => {
      const match = current.find((sr) => sr.id === cr.id);
      return match && match.approved !== cr.approved;
    });

    if (hasNewIds || hasDifferentApproved || clientReviews.length > current.length) {
      inMemoryStore.customer_reviews = clientReviews;
      inMemoryStore.updatedAt = new Date().toISOString();
      inMemoryStore.version = Date.now();
      persistStore();
    }
    return inMemoryStore.customer_reviews;
  },

  getAdminUser() {
    return inMemoryStore.admin_user;
  },

  setAdminUser(user: any) {
    inMemoryStore.admin_user = user;
    inMemoryStore.updatedAt = new Date().toISOString();
    inMemoryStore.version = Date.now();
    persistStore();
  },

  getDefaultReviews() {
    return initialDefaultReviews;
  },
};

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded video and image media with byte range request support (for smooth loop and seek)
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res, filePath) => {
    res.setHeader('Accept-Ranges', 'bytes');
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    }
  }
}));

// Helper to collect raw stream data if req.body is not already a Buffer
function collectRawStream(req: Request): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      return resolve(req.body);
    }
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

function saveUploadBuffer(filename: string, buffer: Buffer): void {
  const p1 = path.join(UPLOADS_DIR, filename);
  const p2 = path.join(DATA_UPLOADS_DIR, filename);
  fs.writeFileSync(p1, buffer);
  try {
    fs.writeFileSync(p2, buffer);
  } catch (err) {
    console.warn('Could not mirror upload to data dir:', err);
  }
}

// Dedicated video upload endpoint supporting direct binary streaming and JSON payloads
app.post('/api/upload-video', async (req: Request, res: Response) => {
  try {
    // 1. Check if JSON payload with base64 dataUrl
    if (req.body && typeof req.body === 'object' && req.body.dataUrl) {
      const dataUrl = req.body.dataUrl as string;
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let ext = '.mp4';
      let buffer: Buffer;
      if (matches && matches.length === 3) {
        const mime = matches[1].toLowerCase();
        if (mime.includes('webm')) ext = '.webm';
        else if (mime.includes('quicktime')) ext = '.mov';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(dataUrl, 'base64');
      }
      const filename = `bg_video_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;
      saveUploadBuffer(filename, buffer);
      console.log(`[Upload] Saved video ${filename} (${buffer.length} bytes) via base64`);
      res.json({ success: true, url: `/uploads/${filename}`, size: buffer.length, filename });
      return;
    }

    // 2. Direct binary streaming
    const buffer = await collectRawStream(req);
    if (!buffer || buffer.length === 0) {
      res.status(400).json({ success: false, error: 'Empty file payload' });
      return;
    }

    const rawFilename = (req.query.filename as string) || `video_${Date.now()}.mp4`;
    const cleanExt = path.extname(rawFilename).toLowerCase() || '.mp4';
    const safeExt = ['.mp4', '.webm', '.ogg', '.mov'].includes(cleanExt) ? cleanExt : '.mp4';
    const filename = `bg_video_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${safeExt}`;
    saveUploadBuffer(filename, buffer);
    console.log(`[Upload] Saved video ${filename} (${buffer.length} bytes) via binary upload`);

    res.json({
      success: true,
      url: `/uploads/${filename}`,
      size: buffer.length,
      filename,
    });
  } catch (err: any) {
    console.error('Video upload error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to upload video' });
  }
});

// Dedicated image upload endpoint supporting base64 and binary payloads up to 50MB
app.post('/api/upload-image', async (req: Request, res: Response) => {
  try {
    // 1. Check if JSON payload with base64 dataUrl
    if (req.body && typeof req.body === 'object' && req.body.dataUrl) {
      const { dataUrl, filename: suggestedName, type } = req.body;
      const matches = (dataUrl as string).match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let ext = '.png';
      let buffer: Buffer;

      if (matches && matches.length === 3) {
        const mime = matches[1].toLowerCase();
        if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('svg')) ext = '.svg';
        else if (mime.includes('gif')) ext = '.gif';
        else if (mime.includes('png')) ext = '.png';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(dataUrl, 'base64');
      }

      const prefix = type ? `${type}_` : 'img_';
      const cleanName = suggestedName ? path.parse(suggestedName).name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30) : '';
      const filename = `${prefix}${cleanName ? `${cleanName}_` : ''}${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;
      saveUploadBuffer(filename, buffer);
      console.log(`[Upload] Saved image ${filename} (${buffer.length} bytes) via base64`);

      res.json({
        success: true,
        url: `/uploads/${filename}`,
        size: buffer.length,
        filename,
      });
      return;
    }

    // 2. Direct binary streaming
    const buffer = await collectRawStream(req);
    if (!buffer || buffer.length === 0) {
      res.status(400).json({ success: false, error: 'Empty file payload' });
      return;
    }

    const rawFilename = (req.query.filename as string) || `image_${Date.now()}.png`;
    const cleanExt = path.extname(rawFilename).toLowerCase() || '.png';
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(cleanExt) ? cleanExt : '.png';
    const prefix = (req.query.type as string) ? `${req.query.type}_` : 'img_';
    const filename = `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 7)}${safeExt}`;
    saveUploadBuffer(filename, buffer);
    console.log(`[Upload] Saved image ${filename} (${buffer.length} bytes) via binary upload`);

    res.json({
      success: true,
      url: `/uploads/${filename}`,
      size: buffer.length,
      filename,
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to upload image' });
  }
});

// Anti-cache middleware for mobile & desktop to prevent serving stale versions
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});

// ==========================================
// LOCAL CLONE BACKEND (same-origin PostgREST/Auth shim)
// Keeps bookings, inquiries, CMS settings and admin fallback data in this
// clone's own file-backed store instead of writing to the source website's
// public Supabase project. Set VITE_USE_REMOTE_SUPABASE=true to use a real
// Supabase project instead.
// ==========================================

const LOCAL_TABLE_ALIASES: Record<string, string> = {
  bookings: 'appointments',
};

function normalizeLocalTable(table: string): string {
  return LOCAL_TABLE_ALIASES[table] || table;
}

function getLocalCollection(table: string): any[] {
  if (table === 'appointments') {
    if (!Array.isArray(inMemoryStore.appointments)) inMemoryStore.appointments = [];
    return inMemoryStore.appointments;
  }
  if (table === 'contact_inquiries') {
    if (!Array.isArray(inMemoryStore.contact_inquiries)) inMemoryStore.contact_inquiries = [];
    return inMemoryStore.contact_inquiries;
  }
  return [];
}

function touchLocalStore(): void {
  inMemoryStore.updatedAt = new Date().toISOString();
  inMemoryStore.version = Date.now();
  persistStore();
}

function rowMatchesEqFilters(row: any, query: Record<string, any>): boolean {
  for (const [key, raw] of Object.entries(query)) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value !== 'string' || !value.startsWith('eq.')) continue;
    if (String(row[key]) !== value.slice(3)) return false;
  }
  return true;
}

function wantsRepresentation(req: Request): boolean {
  return String(req.headers.prefer || '').includes('return=representation');
}

function newLocalId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

app.options('/__local-supabase/*', (_req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.status(204).end();
});

app.all('/__local-supabase/rest/v1/:table', (req: Request, res: Response) => {
  const method = req.method.toUpperCase();
  const table = normalizeLocalTable(String(req.params.table));
  const query = req.query as Record<string, any>;
  const limitRaw = Array.isArray(query.limit) ? query.limit[0] : query.limit;
  const limit = limitRaw ? Math.max(0, Number.parseInt(String(limitRaw), 10) || 0) : 0;
  const preferRepresentation = wantsRepresentation(req);

  if (table === 'site_settings') {
    if (!inMemoryStore.site_settings || typeof inMemoryStore.site_settings !== 'object' || Array.isArray(inMemoryStore.site_settings)) {
      inMemoryStore.site_settings = {};
    }
    const settings = inMemoryStore.site_settings as Record<string, any>;

    if (method === 'GET') {
      let rows = Object.values(settings);
      rows = rows.filter((row) => rowMatchesEqFilters(row, query));
      if (limit) rows = rows.slice(0, limit);
      res.json(rows);
      return;
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const payload = Array.isArray(req.body) ? req.body : [req.body];
      const saved: any[] = [];
      for (const incoming of payload) {
        if (!incoming || typeof incoming !== 'object') continue;
        const row = {
          ...incoming,
          updated_at: new Date().toISOString(),
        };
        if (row.key) settings[String(row.key)] = row;
        saved.push(row);
      }
      touchLocalStore();
      res.status(method === 'POST' ? 201 : 200).json(preferRepresentation ? saved : []);
      return;
    }

    if (method === 'DELETE') {
      let removed = 0;
      for (const key of Object.keys(settings)) {
        if (rowMatchesEqFilters(settings[key], query)) {
          delete settings[key];
          removed += 1;
        }
      }
      if (removed) touchLocalStore();
      res.json([]);
      return;
    }
  }

  // The local clone intentionally has no Supabase Auth users or custom admin table.
  // Empty results make the app fall through to its Express admin login fallback.
  if (table === 'admin_users' || table === 'profiles') {
    res.json([]);
    return;
  }

  const collection = getLocalCollection(table);

  if (method === 'GET') {
    let rows = collection.filter((row) => rowMatchesEqFilters(row, query));
    const orderRaw = Array.isArray(query.order) ? query.order[0] : query.order;
    const order = orderRaw ? String(orderRaw) : '';
    if (order.includes('created_at.desc')) {
      rows = [...rows].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    } else if (order.includes('created_at.asc')) {
      rows = [...rows].sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')));
    }
    if (limit) rows = rows.slice(0, limit);
    res.json(rows);
    return;
  }

  if (method === 'POST') {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const inserted: any[] = [];
    for (const incoming of payload) {
      if (!incoming || typeof incoming !== 'object') continue;
      const row = {
        id: incoming.id || newLocalId(table === 'contact_inquiries' ? 'inq' : 'apt'),
        ...incoming,
        created_at: incoming.created_at || new Date().toISOString(),
      };
      collection.unshift(row);
      inserted.push(row);
    }
    if (inserted.length) touchLocalStore();
    res.status(201).json(preferRepresentation ? inserted : []);
    return;
  }

  if (method === 'PATCH' || method === 'PUT') {
    const updates = Array.isArray(req.body) ? req.body[0] || {} : req.body || {};
    const changed: any[] = [];
    for (let i = 0; i < collection.length; i += 1) {
      if (rowMatchesEqFilters(collection[i], query)) {
        collection[i] = { ...collection[i], ...updates };
        changed.push(collection[i]);
      }
    }
    if (changed.length) touchLocalStore();
    res.json(preferRepresentation ? changed : []);
    return;
  }

  if (method === 'DELETE') {
    const kept: any[] = [];
    const removed: any[] = [];
    for (const row of collection) {
      if (rowMatchesEqFilters(row, query)) removed.push(row);
      else kept.push(row);
    }
    if (table === 'appointments') inMemoryStore.appointments = kept;
    else if (table === 'contact_inquiries') inMemoryStore.contact_inquiries = kept;
    if (removed.length) touchLocalStore();
    res.json(preferRepresentation ? removed : []);
    return;
  }

  res.status(405).json({ message: `Method ${method} not supported by local clone backend` });
});

app.all('/__local-supabase/auth/v1/*', (req: Request, res: Response) => {
  const url = req.originalUrl.toLowerCase();
  if (req.method.toUpperCase() === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (url.includes('/logout')) {
    res.status(204).end();
    return;
  }
  if (url.includes('/token')) {
    res.status(400).json({
      message: 'Local clone authentication uses the Express admin fallback.',
      error: 'invalid_grant',
      error_description: 'Invalid login credentials',
    });
    return;
  }
  res.status(401).json({ message: 'Not authenticated' });
});

app.all('/__local-supabase/*', (_req: Request, res: Response) => {
  res.status(404).json({
    code: 'PGRST205',
    message: 'Unknown local clone backend endpoint',
  });
});

// App version & sync heartbeat
app.get('/api/app-info', (_req: Request, res: Response) => {
  res.json({
    ...studioStorage.getAppInfo(),
    status: 'online',
  });
});

// Generic content store endpoint (artists, gallery, hero, about, reviews, philosophy, logo)
app.get('/api/content/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  const value = studioStorage.getValue(key);
  res.json({
    success: true,
    key,
    value,
    updatedAt: studioStorage.getAppInfo().updatedAt,
  });
});

app.post('/api/content/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;
  const result = studioStorage.setValue(key, value);
  res.json(result);
});

// Dedicated Reviews & Moderation API
app.get('/api/reviews', (_req: Request, res: Response) => {
  const reviews = studioStorage.getValue('customer_reviews') || [];
  res.json({
    success: true,
    reviews,
    count: reviews.length,
    updatedAt: studioStorage.getAppInfo().updatedAt,
  });
});

app.post('/api/reviews', async (req: Request, res: Response) => {
  try {
    const { reviews, action, review, id, updates } = req.body;

    // 1. Sync from client if client had modified reviews on laptop
    if (action === 'sync_client' && Array.isArray(reviews)) {
      const synced = studioStorage.syncReviewsIfMore(reviews);
      res.json({ success: true, reviews: synced });
      return;
    }

    // 2. Full array overwrite / batch save
    if (Array.isArray(reviews)) {
      studioStorage.setValue('customer_reviews', reviews);
      res.json({ success: true, reviews });
      return;
    }

    let current = studioStorage.getValue('customer_reviews') || [];

    // 3. Add single review
    if (action === 'add' && review) {
      const newRev = {
        ...review,
        id: review.id || `rev-${Date.now()}`,
        approved: review.approved !== undefined ? review.approved : true,
        date: review.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
      };
      current = [newRev, ...current];
      studioStorage.setValue('customer_reviews', current);
      res.json({ success: true, newReview: newRev, reviews: current });
      return;
    }

    // 4. Toggle approval
    if (action === 'toggle' && id) {
      let nextApproved = true;
      current = current.map((r: any) => {
        if (r.id === id) {
          nextApproved = !(r.approved !== false);
          return { ...r, approved: nextApproved };
        }
        return r;
      });
      studioStorage.setValue('customer_reviews', current);
      res.json({ success: true, approved: nextApproved, reviews: current });
      return;
    }

    // 5. Update review
    if (action === 'update' && id && updates) {
      current = current.map((r: any) => (r.id === id ? { ...r, ...updates } : r));
      studioStorage.setValue('customer_reviews', current);
      res.json({ success: true, reviews: current });
      return;
    }

    // 6. Delete review
    if (action === 'delete' && id) {
      current = current.filter((r: any) => r.id !== id);
      studioStorage.setValue('customer_reviews', current);
      res.json({ success: true, reviews: current });
      return;
    }

    // 7. Reset reviews
    if (action === 'reset') {
      const defaultReviews = studioStorage.getDefaultReviews();
      studioStorage.setValue('customer_reviews', defaultReviews);
      res.json({ success: true, reviews: defaultReviews });
      return;
    }

    res.status(400).json({ success: false, error: 'Unknown action or invalid payload' });
  } catch (err: any) {
    console.error('Error handling reviews API:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// Admin Account & Auth API
app.get('/api/admin/status', (_req: Request, res: Response) => {
  const admin = studioStorage.getAdminUser();
  if (admin) {
    res.json({
      claimed: true,
      adminInfo: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        created_at: admin.created_at,
      },
    });
  } else {
    res.json({ claimed: false });
  }
});

app.post('/api/admin/register', (req: Request, res: Response) => {
  const current = studioStorage.getAdminUser();
  if (current) {
    res.status(400).json({
      success: false,
      error: 'Registration is locked. The single administrative slot for Phoenix Tattooz has already been claimed.',
    });
    return;
  }

  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    res.status(400).json({ success: false, error: 'All fields are required.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    return;
  }

  const salt = 'phoenix_tattooz_secure_2019_hisar';
  const passwordHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  const adminUser = {
    id: 'admin_' + Math.random().toString(36).substring(2, 10),
    email: email.trim().toLowerCase(),
    full_name: fullName.trim(),
    role: 'Master Administrator',
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };

  studioStorage.setAdminUser(adminUser);
  res.json({
    success: true,
    user: {
      id: adminUser.id,
      email: adminUser.email,
      full_name: adminUser.full_name,
      role: adminUser.role,
      created_at: adminUser.created_at,
    },
  });
});

app.post('/api/admin/login', (req: Request, res: Response) => {
  const admin = studioStorage.getAdminUser();
  if (!admin) {
    res.status(401).json({ success: false, error: 'No administrator has been registered yet.' });
    return;
  }

  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password required.' });
    return;
  }

  const salt = 'phoenix_tattooz_secure_2019_hisar';
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');

  if (email.trim().toLowerCase() !== admin.email.toLowerCase() || hash !== admin.password_hash) {
    res.status(401).json({ success: false, error: 'Invalid credentials. Access denied.' });
    return;
  }

  const sessionToken = 'tok_' + Math.random().toString(36).substring(2) + Date.now();
  res.json({
    success: true,
    session: {
      token: sessionToken,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      loggedInAt: new Date().toISOString(),
    },
  });
});

app.post('/api/admin/change-password', (req: Request, res: Response) => {
  const admin = studioStorage.getAdminUser();
  if (!admin) {
    res.status(401).json({ success: false, error: 'No administrator registered.' });
    return;
  }
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
    return;
  }
  const salt = 'phoenix_tattooz_secure_2019_hisar';
  const currentHash = crypto.createHash('sha256').update(currentPassword + salt).digest('hex');
  if (currentHash !== admin.password_hash) {
    res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    return;
  }
  const newHash = crypto.createHash('sha256').update(newPassword + salt).digest('hex');
  admin.password_hash = newHash;
  studioStorage.setAdminUser(admin);
  res.json({ success: true, message: 'Admin password updated successfully.' });
});

// ==========================================
// CLIENT MEMBER AUTHENTICATION & REWARDS API
// ==========================================

// In-memory active member sessions (token -> userId)
const memberSessions = new Map<string, string>();

function getMemberFromReq(req: Request): any | null {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-member-token']) {
    token = String(req.headers['x-member-token']).trim();
  } else if (req.body && req.body.token) {
    token = String(req.body.token).trim();
  } else if (req.query && req.query.token) {
    token = String(req.query.token).trim();
  }
  if (!token) return null;
  const userId = memberSessions.get(token);
  if (!userId) return null;
  const users: any[] = inMemoryStore.member_users || [];
  return users.find((u) => u.id === userId) || null;
}

// 1. Sign Up
app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { name, email, password, birthdate } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, error: 'Please enter your full name.' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUsers: any[] = inMemoryStore.member_users || [];
    const duplicate = existingUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (duplicate) {
      res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');

    // If user provided birth date, grant an instant 15% birthday discount voucher
    const initialClaims: any = {};
    const trimmedBirthdate = (birthdate && typeof birthdate === 'string' && birthdate.trim()) ? birthdate.trim() : null;

    if (trimmedBirthdate) {
      const cleanName = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'PHX';
      const rand = Math.floor(1000 + Math.random() * 9000);
      initialClaims.birthday = {
        code: `PHX15-${cleanName}-${rand}`,
        claimedAt: new Date().toISOString(),
        offerType: 'birthday',
        discountPercentage: 15,
        memberName: name.trim(),
        memberEmail: normalizedEmail,
        birthdate: trimmedBirthdate,
        instantDiscount: true,
      };
    }

    const newMember = {
      id: `mbr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      birthdate: trimmedBirthdate,
      salt,
      password_hash: hash,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      sign_in_count: 1,
      claims: initialClaims,
      sign_in_history: [
        {
          timestamp: new Date().toISOString(),
          type: 'signup',
        },
      ],
    };

    inMemoryStore.member_users = [...existingUsers, newMember];

    // Log to live member activity log for Admin Panel
    if (!inMemoryStore.member_activity_log) inMemoryStore.member_activity_log = [];
    inMemoryStore.member_activity_log.unshift({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      member_id: newMember.id,
      member_name: newMember.name,
      member_email: newMember.email,
      type: 'signup',
      birthdate: newMember.birthdate,
      instant_discount: Boolean(newMember.claims?.birthday),
      discount_code: newMember.claims?.birthday?.code || null,
      timestamp: new Date().toISOString(),
    });
    if (inMemoryStore.member_activity_log.length > 150) {
      inMemoryStore.member_activity_log = inMemoryStore.member_activity_log.slice(0, 150);
    }

    persistStore();

    const token = 'tok_mbr_' + crypto.randomBytes(24).toString('hex') + Date.now();
    memberSessions.set(token, newMember.id);

    console.log(`[MemberAuth] New member registered: ${newMember.email} (${newMember.name}) ${trimmedBirthdate ? `[DOB: ${trimmedBirthdate} - Instant 15% code]` : ''}`);

    res.json({
      success: true,
      token,
      user: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        birthdate: newMember.birthdate,
        claims: newMember.claims,
        created_at: newMember.created_at,
        last_login: newMember.last_login,
        sign_in_count: newMember.sign_in_count,
      },
    });
  } catch (err: any) {
    console.error('Member signup error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server signup error' });
  }
});

// 2. Sign In
app.post('/api/auth/signin', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUsers: any[] = inMemoryStore.member_users || [];
    const user = existingUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      res.status(401).json({ success: false, error: 'No member account found with this email. Please sign up.' });
      return;
    }

    const hash = crypto.createHash('sha256').update(password + user.salt).digest('hex');
    if (hash !== user.password_hash) {
      res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
      return;
    }

    const loginTimestamp = new Date().toISOString();
    user.last_login = loginTimestamp;
    user.sign_in_count = (user.sign_in_count || 0) + 1;
    if (!user.sign_in_history) user.sign_in_history = [];
    user.sign_in_history.unshift({
      timestamp: loginTimestamp,
      type: 'signin',
    });
    if (user.sign_in_history.length > 20) {
      user.sign_in_history = user.sign_in_history.slice(0, 20);
    }

    // Log to live member activity log for Admin Panel
    if (!inMemoryStore.member_activity_log) inMemoryStore.member_activity_log = [];
    inMemoryStore.member_activity_log.unshift({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      member_id: user.id,
      member_name: user.name,
      member_email: user.email,
      type: 'signin',
      birthdate: user.birthdate || null,
      instant_discount: Boolean(user.claims?.birthday),
      discount_code: user.claims?.birthday?.code || null,
      timestamp: loginTimestamp,
    });
    if (inMemoryStore.member_activity_log.length > 150) {
      inMemoryStore.member_activity_log = inMemoryStore.member_activity_log.slice(0, 150);
    }

    persistStore();

    const token = 'tok_mbr_' + crypto.randomBytes(24).toString('hex') + Date.now();
    memberSessions.set(token, user.id);

    console.log(`[MemberAuth] Member logged in: ${user.email} (Total sign-ins: ${user.sign_in_count})`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthdate: user.birthdate || null,
        claims: user.claims || {},
        created_at: user.created_at,
        last_login: user.last_login,
        sign_in_count: user.sign_in_count,
      },
    });
  } catch (err: any) {
    console.error('Member signin error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server signin error' });
  }
});

// 3. Current User Profile (/api/auth/me)
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getMemberFromReq(req);
  if (!user) {
    res.status(401).json({ success: false, authenticated: false, error: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      birthdate: user.birthdate || null,
      claims: user.claims || {},
      created_at: user.created_at,
      last_login: user.last_login,
      sign_in_count: user.sign_in_count || 1,
    },
  });
});

// 3.5 Admin Members Directory & Real-Time Logins
app.get('/api/admin/members', (_req: Request, res: Response) => {
  try {
    const rawUsers: any[] = inMemoryStore.member_users || [];
    const members = rawUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      birthdate: u.birthdate || null,
      created_at: u.created_at,
      last_login: u.last_login || u.created_at,
      sign_in_count: u.sign_in_count || 1,
      claims: u.claims || {},
      sign_in_history: u.sign_in_history || [],
    }));

    res.json({
      success: true,
      members,
      activity_log: inMemoryStore.member_activity_log || [],
      total_members: members.length,
    });
  } catch (err: any) {
    console.error('Fetch admin members error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch members' });
  }
});

// Admin Delete Member
app.delete('/api/admin/members/:id', (req: Request, res: Response) => {
  try {
    const memberId = req.params.id;
    const existing: any[] = inMemoryStore.member_users || [];
    inMemoryStore.member_users = existing.filter((u) => u.id !== memberId);
    persistStore();
    res.json({ success: true, message: 'Member account removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to delete member' });
  }
});

// 4. Sign Out
app.post('/api/auth/signout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-member-token']) {
    token = String(req.headers['x-member-token']).trim();
  } else if (req.body && req.body.token) {
    token = String(req.body.token).trim();
  }
  if (token) {
    memberSessions.delete(token);
  }
  res.json({ success: true, message: 'Signed out successfully' });
});

// 5. One-Time Rewards Claim API
app.post('/api/rewards/claim', (req: Request, res: Response) => {
  try {
    const user = getMemberFromReq(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Please sign in or create an account to claim your rewards and gifts.',
      });
      return;
    }

    const { offerType = 'birthday' } = req.body || {};
    if (!['birthday', 'referral', 'welcome'].includes(offerType)) {
      res.status(400).json({ success: false, error: 'Invalid reward offer type.' });
      return;
    }

    if (!user.claims) {
      user.claims = {};
    }

    // STRICT ONE-TIME CLAIM VERIFICATION: If user already claimed, return existing code with alreadyClaimed flag
    if (user.claims[offerType]) {
      res.json({
        success: true,
        alreadyClaimed: true,
        claim: user.claims[offerType],
        message: `You have already claimed this ${offerType} offer. Each offer is limited to one claim per member.`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          claims: user.claims,
        },
      });
      return;
    }

    // Generate unique personalized voucher code
    const initials = (user.name || 'VIP').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'PHX';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    let code = '';

    if (offerType === 'birthday') {
      code = `PHX15-${initials}-${randomSuffix}`;
    } else if (offerType === 'referral') {
      code = `REF-${initials}-${randomSuffix}`;
    } else {
      code = `GIFT-${initials}-${randomSuffix}`;
    }

    const newClaim = {
      code,
      claimedAt: new Date().toISOString(),
      offerType,
      discountPercentage: offerType === 'birthday' ? 15 : undefined,
      memberName: user.name,
      memberEmail: user.email,
    };

    user.claims[offerType] = newClaim;
    persistStore();

    console.log(`[Rewards] One-time offer claimed: ${offerType} by ${user.email} (Code: ${code})`);

    res.json({
      success: true,
      alreadyClaimed: false,
      claim: newClaim,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        claims: user.claims,
      },
    });
  } catch (err: any) {
    console.error('Reward claim error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to claim reward.' });
  }
});

// 6. Member's Claimed Rewards
app.get('/api/rewards/my-claims', (req: Request, res: Response) => {
  const user = getMemberFromReq(req);
  if (!user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }
  res.json({
    success: true,
    claims: user.claims || {},
  });
});

// Studio System Knowledge Grounding
const STUDIO_SYSTEM_PROMPT = `You are "Phoenix AI", the official studio assistant for Phoenix Tattooz Studio & Academy in Hisar, Haryana, India.
You provide warm, artistic, knowledgeable, respectful, and helpful guidance to clients and visitors.

Key Information about Phoenix Tattooz Studio:
- Founder & Master Artist: Rohit Sharma (8+ years experience, 1500+ tattoos completed, internationally recognized realism, portrait, and black & grey master).
- Resident Artists:
  * Kavya Singh (Fine line, botanical, watercolor & color illustrative specialist).
  * Aryan Verma (Geometric, tribal, sacred geometry, and modern calligraphy specialist).
- Studio Address: 2nd Floor, Red Square Market Cue-1, SCO-159, near Bikaner sweets & Pahuja bakers, Hisar, Haryana 125001, India.
- Operating Hours: 10:00 AM to 9:00 PM, 7 days a week (Monday to Sunday).
- Contact Phone / WhatsApp: +91 99929 69919 (or 09992969919).
- Email: phoenixtattoozhisar@gmail.com
- Services:
  1. Custom Tattooing: Black & Grey Realism, Portraiture, Fine-Line, Color Illustrative, Japanese/Oriental, Minimalist, Script & Lettering.
  2. Tattoo Cover-Ups & Reworks: Expert consultation to transform old, faded, or unwanted tattoos into stunning fresh art.
  3. Cosmetic Tattooing: Microblading, Ombre Powder Brows, Lip Blush, Lash Line Enhancement.
  4. Body Piercing: Ear (lobe, helix, industrial, tragus), Nose, Septum, Belly/Navel, Eyebrow, Tongue. Always performed using 100% implant-grade titanium jewelry and sterile needles.
  5. Phoenix Tattoo Academy: Professional hands-on certification training (3-month & 6-month intensive courses) covering tattoo mechanics, hygiene/sterilization protocols, skin anatomy, stencil art, client management, and practical needle work on synthetic skins and supervised models.

Pricing Guidance (Approximations):
- Studio Minimum Setup: ₹1,000 - ₹1,500 (covers single-use medical-grade sterile kit, consumables, and artist prep).
- Small / Minimalist pieces (1-3 inches): ~₹1,500 - ₹3,500.
- Medium Custom Pieces: ~₹4,000 - ₹12,000 depending on detail, shading, and placement.
- Large Projects (Sleeves, Backpieces, Chest): Priced per session or hourly package after an in-person design consultation.
- Piercing: ₹500 - ₹1,500 including sterile titanium initial jewelry.
- Consultation: 100% Free initial design consultation and placement sizing.

Hygiene & Safety Standards (100% Hospital Grade):
- Single-use, sealed, sterilized needle cartridges opened directly in front of the client.
- Medical-grade autoclave sterilization for reusable stainless tools.
- Premium, certified, non-toxic, vegan inks (Dynamic, Eternal, World Famous).
- Complete barrier protection (clip cord sleeves, machine bags, dental bibs, medical nitrile gloves).
- Biohazard sharps disposal adhering to clinical standards.

Aftercare Protocols (Standard Healing):
- Leave the protective bandage / second skin on for 3-4 hours (or 24-48 hours if using Derm Shield / SecondSkin).
- Wash gently with lukewarm water and mild fragrance-free antibacterial soap. Pat dry with clean paper towel (never rub).
- After day 3, apply a whisper-thin layer of unscented tattoo balm or lotion 2-3 times daily. Do not over-saturate.
- DO NOT scratch, peel, or pick scabs.
- NO swimming, hot tubs, baths, or saunas for 2-3 weeks. Quick showers only.
- Protect from direct sunlight during healing; use SPF 50+ once fully healed.

Instructions for your responses:
- Be concise, friendly, and structured. Use bullet points or short paragraphs for readability.
- When the user asks about booking, tell them they can book right here using the "Book Appointment" button or visit in person at Red Square Market, Hisar.
- You are powered strictly by the free-tier Gemini 3.8 Flash model. Never suggest any paid model or subscription.`;

// Intelligent fallback generator for zero-downtime reliability
function generateSmartFallback(message: string): string {
  const query = message.toLowerCase();

  if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('how much') || query.includes('charge')) {
    return `**Phoenix Tattooz Pricing Guide:**\n\n` +
      `• **Studio Minimum:** ₹1,000 - ₹1,500 (covers single-use sterile medical setup & consumables)\n` +
      `• **Small / Minimalist Tattoos (1–3 inches):** Starting from ₹1,500 – ₹3,500\n` +
      `• **Medium Custom Artworks:** ₹4,000 – ₹12,000 depending on intricate shading and color\n` +
      `• **Large Scale (Sleeves, Chest, Back):** Quoted per session during consultation\n` +
      `• **Body Piercing:** ₹500 – ₹1,500 (includes sterile implant-grade titanium jewelry)\n\n` +
      `💡 *We offer 100% FREE design consultations! Click **"Book Appointment"** to reserve your slot or chat with us on WhatsApp at +91 99929 69919.*`;
  }

  if (query.includes('aftercare') || query.includes('heal') || query.includes('care') || query.includes('wash') || query.includes('cream') || query.includes('lotion')) {
    return `**Essential Tattoo Aftercare Instructions:**\n\n` +
      `1. **First 3–4 Hours:** Leave initial protective bandage on. Remove gently and wash with lukewarm water & fragrance-free antibacterial soap.\n` +
      `2. **Drying:** Gently pat dry with a clean paper towel. Never rub with a cloth towel.\n` +
      `3. **Moisturizing (Day 3+):** Apply a tiny, sheer layer of unscented tattoo balm or lotion 2–3 times daily. Avoid over-applying.\n` +
      `4. **What to Avoid:** No swimming (pools/hot tubs) for 2–3 weeks, avoid direct sunlight, and **never pick or scratch scabs**.\n\n` +
      `Have questions about your healing? Feel free to visit the studio or call us at +91 99929 69919!`;
  }

  if (query.includes('pain') || query.includes('hurt') || query.includes('sensitive')) {
    return `**Tattoo Pain & Sensitivity Guide:**\n\n` +
      `Pain varies depending on placement:\n` +
      `• **Least painful:** Outer bicep, forearm, outer thigh, calves.\n` +
      `• **Moderate:** Shoulder, wrist, upper back.\n` +
      `• **Most sensitive:** Ribs, fingers, neck, spine, inner ankle.\n\n` +
      `Our master artists use fine-tuned modern rotary machines and gentle techniques to keep you comfortable. We take regular breaks whenever you need!`;
  }

  if (query.includes('book') || query.includes('appointment') || query.includes('consult') || query.includes('slot') || query.includes('visit')) {
    return `**How to Book at Phoenix Tattooz:**\n\n` +
      `• **Online:** Click the yellow **"Book Appointment"** button on this website to select your artist, service, date, and preferred time.\n` +
      `• **Direct Phone / WhatsApp:** +91 99929 69919\n` +
      `• **Walk-in Consultation:** 2nd Floor, Red Square Market Cue-1, SCO-159 (near Bikaner Sweets), Hisar, Haryana.\n` +
      `• **Studio Hours:** 10:00 AM – 9:00 PM, every single day!`;
  }

  if (query.includes('artist') || query.includes('rohit') || query.includes('kavya') || query.includes('aryan')) {
    return `**Meet Our Resident Master Artists:**\n\n` +
      `• **Rohit Sharma (Founder & Master Artist):** 8+ years experience, 1500+ tattoos. Specializes in Hyper-Realism, Black & Grey, Portraits, and Large Custom Projects.\n` +
      `• **Kavya Singh:** Specialist in Fine-Line precision, Botanical, Watercolor, and Illustrative color tattoos.\n` +
      `• **Aryan Verma:** Specialist in Sacred Geometry, Tribal, Dotwork, and Modern Script/Calligraphy.\n\n` +
      `You can explore each artist's full portfolio in our **Artists** section!`;
  }

  if (query.includes('pierce') || query.includes('piercing')) {
    return `**Professional Body Piercing at Phoenix:**\n\n` +
      `• **Services:** Ear Lobe, Helix, Tragus, Conch, Industrial, Nose Pin/Ring, Septum, Eyebrow, and Navel/Belly.\n` +
      `• **Jewelry:** 100% Medical Implant-Grade Titanium (hypoallergenic, nickel-free).\n` +
      `• **Price Range:** ₹500 – ₹1,500 depending on placement and jewelry selection.\n` +
      `• **Safety:** Single-use sterile catheter needles, hospital-grade autoclave sanitation.`;
  }

  if (query.includes('review') || query.includes('feedback') || query.includes('rating') || query.includes('thought') || query.includes('view') || query.includes('philosophy') || query.includes('creed')) {
    return `**Client Reviews & Studio Views at Phoenix Tattooz:**\n\n` +
      `• **Rating:** 5.0 ★ Stars across 1,000+ satisfied clients in Hisar, Haryana & NCR.\n` +
      `• **Our Core Philosophy — “Same Skin, Different Story”:** We never copy-paste stencils. Every custom tattoo is an intimate chapter of your life, crafted with hospital-grade sterility and fine art mastery.\n` +
      `• **Client Highlights:** Hyper-realism portraits by Rohit Sharma, delicate botanical lines by Sneha, pain-free application, and lifetime touch-up support.\n` +
      `• **Read & Share:** You can explore all verified reviews and submit your own feedback in our dedicated **Reviews** section!`;
  }

  if (query.includes('academy') || query.includes('learn') || query.includes('course') || query.includes('training') || query.includes('classes')) {
    return `**Phoenix Tattoo Academy Certification Courses:**\n\n` +
      `Turn your passion into a certified professional tattoo career:\n` +
      `• **Comprehensive Modules:** Machine tuning & needle dynamics, skin anatomy & physiology, sterile cross-contamination prevention, advanced stencil creation, realism shading, and real client practice.\n` +
      `• **Duration:** 3-Month Foundations or 6-Month Masterclass with lifetime mentorship.\n` +
      `• Contact Master Rohit Sharma directly at +91 99929 69919 to enroll or schedule an academy tour.`;
  }

  if (query.includes('location') || query.includes('address') || query.includes('where') || query.includes('timing') || query.includes('hours') || query.includes('open')) {
    return `**Studio Location & Working Hours:**\n\n` +
      `📍 **Address:** 2nd Floor, Red Square Market Cue-1, SCO-159, near Bikaner sweets & Pahuja bakers, Hisar, Haryana 125001\n` +
      `⏰ **Hours:** 10:00 AM – 9:00 PM (Open 7 days a week, Monday through Sunday)\n` +
      `📞 **Call / WhatsApp:** +91 99929 69919\n` +
      `✉️ **Email:** phoenixtattoozhisar@gmail.com`;
  }

  return `Welcome to **Phoenix Tattooz Studio & Academy** in Hisar!\n\n` +
    `I can help you with:\n` +
    `• **Custom Tattoo Ideas & Sizing Estimates**\n` +
    `• **Pricing & Free Consultations**\n` +
    `• **Aftercare & Safe Healing Steps**\n` +
    `• **Body Piercing Options & Safety**\n` +
    `• **Master Artists (Rohit, Kavya, Aryan)**\n` +
    `• **Tattoo Academy Professional Training**\n\n` +
    `What would you like to know today? You can also click **"Book Appointment"** at any time to reserve your session.`;
}

// Server-side AI Chat Endpoint (Using free Gemini 3.8 Flash model)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is configured, use the free gemini-3.8-flash model
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        // Format conversation history for Gemini SDK
        const contents: any[] = [];

        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item.role === 'user' || item.role === 'model') {
              contents.push({
                role: item.role,
                parts: [{ text: String(item.text) }],
              });
            }
          }
        }

        // Add latest user message
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        // Generate response using FREE gemini-3.8-flash model
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: STUDIO_SYSTEM_PROMPT,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        const replyText = response.text || generateSmartFallback(message);

        res.json({
          reply: replyText,
          model: 'gemini-3.8-flash (Free)',
          status: 'success',
        });
        return;
      } catch (genAiError: any) {
        console.warn('Gemini API call warning, falling back to smart studio knowledge base:', genAiError?.message || genAiError);
        // Fallback gracefully so user experience is smooth and uninterrupted
        const fallbackReply = generateSmartFallback(message);
        res.json({
          reply: fallbackReply,
          model: 'gemini-3.8-flash (Studio Knowledge Fallback)',
          status: 'fallback',
        });
        return;
      }
    }

    // When API key is not yet set in environment, use smart studio knowledge engine
    const reply = generateSmartFallback(message);
    res.json({
      reply,
      model: 'gemini-3.8-flash (Studio Free Tier Engine)',
      status: 'offline_mode',
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error?.message || 'Unknown error',
    });
  }
});

// App Entry / Server Setup
async function startServer() {
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('--port');
  const portArg = portIndex !== -1 && args[portIndex + 1] ? parseInt(args[portIndex + 1], 10) : null;
  const PORT = portArg || Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV === 'production') {
    // Serve production static build
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Phoenix Studio Server] Running on http://0.0.0.0:${PORT} (Node: ${process.version})`);
  });
}

startServer();
