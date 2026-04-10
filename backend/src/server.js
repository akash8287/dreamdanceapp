import crypto from 'node:crypto';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { isS3Enabled, uploadFileToS3 } from './s3upload.js';
import { loadVideos, saveVideos } from './store.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const UPLOADS = path.join(ROOT, 'uploads');

if (!fs.existsSync(UPLOADS)) {
  fs.mkdirSync(UPLOADS, { recursive: true });
}

const PORT = Number(process.env.PORT) || 3001;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 500 },
});

const app = express();
// Tunnels (Tunnelmole, ngrok, cloudflared) send X-Forwarded-*; needed for correct https + host in API URLs.
app.set('trust proxy', true);
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS));
app.use(express.static(path.join(ROOT, 'public')));

function adminAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="GrooveX Admin"');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const decoded = Buffer.from(h.slice(6), 'base64').toString('utf8');
  const idx = decoded.indexOf(':');
  const u = idx >= 0 ? decoded.slice(0, idx) : '';
  const p = idx >= 0 ? decoded.slice(idx + 1) : '';
  if (u !== ADMIN_USER || p !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  next();
}

function publicBaseUrl(req) {
  const override = process.env.PUBLIC_BASE_URL?.trim().replace(/\/+$/, '');
  if (override) {
    return override;
  }
  const xfHost = req.get('x-forwarded-host');
  const xfProto = req.get('x-forwarded-proto');
  if (xfHost) {
    const host = xfHost.split(',')[0].trim();
    const proto =
      (xfProto && xfProto.split(',')[0].trim()) || req.protocol || 'https';
    return `${proto}://${host}`;
  }
  const host = req.get('host');
  return `${req.protocol}://${host}`;
}

function toAbsoluteUrl(req, stored) {
  if (!stored) return '';
  if (/^https?:\/\//i.test(stored)) return stored;
  return `${publicBaseUrl(req)}${stored.startsWith('/') ? '' : '/'}${stored}`;
}

function unlinkLocalStored(relativeOrAbsolute) {
  if (!relativeOrAbsolute || isS3Enabled()) return;
  const u = String(relativeOrAbsolute);
  if (!u.startsWith('/uploads/')) return;
  const p = path.join(ROOT, u.replace(/^\//, ''));
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {
    console.warn('unlinkLocalStored', e);
  }
}

function mapVideoForResponse(req, v) {
  return {
    ...v,
    streamUrl: toAbsoluteUrl(req, v.streamUrl),
    thumbnailUrl: v.thumbnailUrl ? toAbsoluteUrl(req, v.thumbnailUrl) : null,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'groovex-backend',
    s3: isS3Enabled(),
  });
});

app.get('/api/videos', (req, res) => {
  const { category } = req.query;
  let list = loadVideos();
  if (category && category !== 'all') {
    list = list.filter((v) => v.category === category);
  }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ videos: list.map((v) => mapVideoForResponse(req, v)) });
});

app.get('/api/videos/featured', (req, res) => {
  const list = loadVideos()
    .filter((v) => v.featured)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ videos: list.map((v) => mapVideoForResponse(req, v)) });
});

/** Same as public list but requires admin (optional tighter control). */
app.get('/api/admin/videos', adminAuth, (req, res) => {
  const list = loadVideos().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({ videos: list.map((v) => mapVideoForResponse(req, v)) });
});

app.post(
  '/api/admin/videos',
  adminAuth,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const videoFile = req.files?.video?.[0];
      if (!videoFile) {
        return res.status(400).json({ error: 'Missing video file' });
      }
      const title = String(req.body.title || '').trim() || 'Untitled';
      const description = String(req.body.description || '').trim();
      const category = req.body.category === 'dance' ? 'dance' : 'audition';
      const featured =
        req.body.featured === 'true' ||
        req.body.featured === true ||
        req.body.featured === 'on';
      const thumbFile = req.files?.thumbnail?.[0];

      const id = crypto.randomUUID?.() ?? crypto.randomBytes(16).toString('hex');
      let streamUrl;
      let thumbnailUrl = null;

      if (isS3Enabled()) {
        const vKey = `videos/${id}${path.extname(videoFile.filename)}`;
        streamUrl = await uploadFileToS3(videoFile.path, vKey);
        fs.unlinkSync(videoFile.path);
        if (thumbFile) {
          const tKey = `thumbnails/${id}${path.extname(thumbFile.filename)}`;
          thumbnailUrl = await uploadFileToS3(thumbFile.path, tKey);
          fs.unlinkSync(thumbFile.path);
        }
      } else {
        streamUrl = `/uploads/${videoFile.filename}`;
        if (thumbFile) {
          thumbnailUrl = `/uploads/${thumbFile.filename}`;
        }
      }

      const row = {
        id,
        title,
        description,
        category,
        featured,
        streamUrl,
        thumbnailUrl,
        createdAt: new Date().toISOString(),
      };

      const all = loadVideos();
      all.push(row);
      saveVideos(all);

      res.status(201).json({ video: mapVideoForResponse(req, row) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message || 'Upload failed' });
    }
  }
);

app.delete('/api/admin/videos/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const all = loadVideos();
  const idx = all.findIndex((v) => v.id === id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  const [removed] = all.splice(idx, 1);
  saveVideos(all);

  if (removed) {
    unlinkLocalStored(removed.streamUrl);
    unlinkLocalStored(removed.thumbnailUrl);
  }

  res.json({ ok: true });
});

app.patch('/api/admin/videos/:id/featured', adminAuth, (req, res) => {
  const { id } = req.params;
  const featured = Boolean(req.body?.featured);
  const all = loadVideos();
  const v = all.find((x) => x.id === id);
  if (!v) return res.status(404).json({ error: 'Not found' });
  v.featured = featured;
  saveVideos(all);
  res.json({ video: mapVideoForResponse(req, v) });
});

app.patch('/api/admin/videos/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const all = loadVideos();
  const v = all.find((x) => x.id === id);
  if (!v) return res.status(404).json({ error: 'Not found' });

  const { title, description, category, featured } = req.body ?? {};
  if (title !== undefined) {
    const t = String(title).trim();
    if (t) v.title = t;
  }
  if (description !== undefined) {
    v.description = String(description).trim();
  }
  if (category !== undefined) {
    v.category = category === 'dance' ? 'dance' : 'audition';
  }
  if (featured !== undefined) {
    v.featured =
      featured === true ||
      featured === 'true' ||
      featured === 'on' ||
      featured === 1;
  }

  saveVideos(all);
  res.json({ video: mapVideoForResponse(req, v) });
});

app.post(
  '/api/admin/videos/:id/media',
  adminAuth,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const all = loadVideos();
      const v = all.find((x) => x.id === id);
      if (!v) return res.status(404).json({ error: 'Not found' });

      const videoFile = req.files?.video?.[0];
      const thumbFile = req.files?.thumbnail?.[0];
      if (!videoFile && !thumbFile) {
        return res
          .status(400)
          .json({ error: 'Provide a new video file and/or thumbnail' });
      }

      if (videoFile) {
        unlinkLocalStored(v.streamUrl);
        if (isS3Enabled()) {
          const vKey = `videos/${id}${path.extname(videoFile.filename)}`;
          v.streamUrl = await uploadFileToS3(videoFile.path, vKey);
          fs.unlinkSync(videoFile.path);
        } else {
          v.streamUrl = `/uploads/${videoFile.filename}`;
        }
      }

      if (thumbFile) {
        unlinkLocalStored(v.thumbnailUrl);
        if (isS3Enabled()) {
          const tKey = `thumbnails/${id}${path.extname(thumbFile.filename)}`;
          v.thumbnailUrl = await uploadFileToS3(thumbFile.path, tKey);
          fs.unlinkSync(thumbFile.path);
        } else {
          v.thumbnailUrl = `/uploads/${thumbFile.filename}`;
        }
      }

      saveVideos(all);
      res.json({ video: mapVideoForResponse(req, v) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message || 'Replace media failed' });
    }
  }
);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GrooveX API http://0.0.0.0:${PORT}`);
  console.log(`Admin UI: http://localhost:${PORT}/admin.html`);
  if (isS3Enabled()) console.log('S3 uploads enabled');
  else console.log('Local uploads → ./uploads (set S3 env for S3)');
});
