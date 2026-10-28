/**
 * Minimal PostgREST/Auth/Storage emulator used ONLY by the automated tests.
 *
 *   node scripts/mock-supabase.mjs   → http://127.0.0.1:54321
 *
 * It implements the small subset of endpoints the API layer touches, so every
 * serverless handler can be exercised end-to-end offline (signup → signin →
 * claim → admin listing → CMS write → upload) without a real Supabase project.
 */
import express from 'express';

const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.raw({ type: '*/*', limit: '100mb' }));

const db = {
  member_users: [],
  member_activity_log: [],
  site_settings: [],
  admin_users: [],
  appointments: [],
  contact_inquiries: [],
};

const RESERVED = new Set(['select', 'limit', 'order', 'on_conflict', 'offset']);

function applyFilters(rows, query) {
  let out = rows.slice();
  for (const [key, raw] of Object.entries(query)) {
    if (RESERVED.has(key)) continue;
    let value = String(raw);
    let op = 'eq';
    const match = value.match(/^(eq|neq|gt|gte|lt|lte|like)\.(.*)$/);
    if (match) {
      op = match[1];
      value = match[2];
    }
    out = out.filter((row) => {
      const cell = row[key];
      switch (op) {
        case 'neq':
          return String(cell) !== value;
        case 'gt':
          return cell > value;
        case 'gte':
          return cell >= value;
        case 'lt':
          return cell < value;
        case 'lte':
          return cell <= value;
        case 'like':
          return String(cell).includes(value.replace(/%/g, ''));
        default:
          return String(cell) === value;
      }
    });
  }

  if (query.order) {
    const [column, direction = 'asc'] = String(query.order).split('.');
    out.sort((a, b) => {
      const av = a[column] ?? '';
      const bv = b[column] ?? '';
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * (direction === 'desc' ? -1 : 1);
    });
  }

  if (query.limit) out = out.slice(0, Number(query.limit));
  return out;
}

function pickColumns(rows, select) {
  if (!select || select === '*') return rows;
  const columns = String(select)
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  return rows.map((row) => {
    const out = {};
    for (const column of columns) out[column] = row[column];
    return out;
  });
}

const TABLE_ALIASES = {};

function tableFor(name) {
  const real = TABLE_ALIASES[name] || name;
  if (!db[real]) db[real] = [];
  return db[real];
}

// --- PostgREST surface -------------------------------------------------------
app.get('/rest/v1/:table', (req, res) => {
  const rows = applyFilters(tableFor(req.params.table), req.query);
  res.json(pickColumns(rows, req.query.select));
});

app.post('/rest/v1/:table', (req, res) => {
  const table = tableFor(req.params.table);
  const incoming = Array.isArray(req.body) ? req.body : [req.body];
  const conflictColumn = req.query.on_conflict;
  const merge = String(req.headers.prefer || '').includes('merge-duplicates');
  const written = [];

  for (const row of incoming) {
    const existingIndex = conflictColumn
      ? table.findIndex((r) => r[conflictColumn] === row[conflictColumn])
      : -1;
    if (existingIndex >= 0) {
      if (!merge) {
        res.status(409).json({ code: '23505', message: 'duplicate key value violates unique constraint' });
        return;
      }
      table[existingIndex] = { ...table[existingIndex], ...row };
      written.push(table[existingIndex]);
    } else {
      table.push(row);
      written.push(row);
    }
  }

  if (String(req.headers.prefer || '').includes('return=representation')) {
    res.status(201).json(written);
  } else {
    res.status(201).send('');
  }
});

app.patch('/rest/v1/:table', (req, res) => {
  const table = tableFor(req.params.table);
  const matches = applyFilters(table, req.query);
  for (const row of matches) Object.assign(row, req.body);
  if (String(req.headers.prefer || '').includes('return=representation')) res.json(matches);
  else res.status(204).send('');
});

app.delete('/rest/v1/:table', (req, res) => {
  const name = req.params.table;
  const table = tableFor(name);
  const matches = applyFilters(table, req.query);
  db[name] = table.filter((row) => !matches.includes(row));
  res.json(matches);
});

// --- Auth --------------------------------------------------------------------
app.post('/auth/v1/token', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.admin_users.find((u) => u.email === String(email).toLowerCase());
  if (!user || password !== 'supabase-auth-password') {
    res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid login credentials' });
    return;
  }
  res.json({
    access_token: 'mock-access-token',
    user: { email: user.email, user_metadata: { full_name: user.full_name } },
  });
});

// --- Storage -----------------------------------------------------------------
const objects = new Map();

// Signed upload URLs (used by /api/upload-sign)
app.post('/storage/v1/object/upload/sign/:bucket/:path(*)', (req, res) => {
  const key = `${req.params.bucket}/${req.params.path}`;
  res.json({ url: `/storage/v1/object/upload/sign/${key}?token=mock-token`, token: 'mock-token' });
});

app.put('/storage/v1/object/upload/sign/:bucket/:path(*)', (req, res) => {
  const key = `${req.params.bucket}/${req.params.path}`;
  const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
  objects.set(key, { size: body.length, type: req.headers['content-type'] });
  res.status(200).json({ Key: key });
});

app.post('/storage/v1/object/:bucket/:path(*)', (req, res) => {
  const key = `${req.params.bucket}/${req.params.path}`;
  const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  objects.set(key, { size: body.length, type: req.headers['content-type'] });
  res.status(200).json({ Key: key });
});

app.get('/storage/v1/object/public/:bucket/:path(*)', (req, res) => {
  const key = `${req.params.bucket}/${req.params.path}`;
  if (!objects.has(key)) {
    res.status(404).send('not found');
    return;
  }
  res.setHeader('Content-Type', objects.get(key).type || 'application/octet-stream');
  res.send(Buffer.from('mock-bytes'));
});

// --- Test helpers ------------------------------------------------------------
app.post('/__test/reset', (_req, res) => {
  for (const key of Object.keys(db)) db[key] = [];
  objects.clear();
  res.json({ ok: true });
});

app.get('/__test/dump', (_req, res) => {
  res.json({ tables: db, objects: [...objects.keys()] });
});

const PORT = Number(process.env.MOCK_PORT) || 54321;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock-supabase] listening on http://127.0.0.1:${PORT}`);
});
