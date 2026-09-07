import express from 'express';
import multer from 'multer';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import sharp from 'sharp';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
const formats = new Set(['jpeg', 'png', 'webp']);
const fail = (status, message) => Object.assign(new Error(message), { status });

export function createApp({ supabase, bucket = 'avatars', logger = console }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 0, parts: 2 },
    fileFilter: (_req, file, cb) => cb(
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
        ? null : fail(415, 'Only JPEG, PNG, and WebP images are supported.'), true),
  }).single('avatar');

  app.use('/api/profile-picture', rateLimit({
    windowMs: 60_000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { error: 'Too many requests. Try again in a minute.' },
  }));
  app.use('/api/profile-picture', async (req, _res, next) => {
    const match = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') || '');
    if (!match) throw fail(401, 'A Supabase Bearer access token is required.');
    const { data, error } = await supabase.auth.getUser(match[1]);
    if (error || !data?.user) throw fail(401, 'Invalid or expired access token.');
    req.user = data.user;
    next();
  });

  async function signedPicture(path) {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) throw fail(502, 'Could not create an avatar viewing URL.');
    return { path, url: data.signedUrl, expiresIn: 3600 };
  }

  app.post('/api/profile-picture', upload, async (req, res) => {
    if (!req.file) throw fail(400, 'Upload one image using the avatar field.');
    let buffer;
    try {
      const input = sharp(req.file.buffer, { limitInputPixels: 25_000_000, failOn: 'warning' });
      const metadata = await input.metadata();
      if (!formats.has(metadata.format) || (metadata.pages || 1) > 1) {
        throw new Error('Unsupported image');
      }
      buffer = await input.rotate().resize(512, 512, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
    } catch {
      throw fail(415, 'Image must be a valid, non-animated JPEG, PNG, or WebP with at most 25 million pixels.');
    }
    const path = `${req.user.id}/avatar.webp`;
    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: 'image/webp', upsert: true, cacheControl: '0',
    });
    if (error) throw fail(502, 'Could not upload the profile picture.');
    // A signing failure does not undo an upload; GET can retry URL creation.
    res.status(200).json({ data: await signedPicture(path) });
  });

  app.get('/api/profile-picture', async (req, res) => {
    const { data, error } = await supabase.storage.from(bucket).list(req.user.id, { search: 'avatar.webp', limit: 10 });
    if (error) throw fail(502, 'Could not load your profile picture. Check the Storage bucket configuration.');
    if (!data?.some(file => file.name === 'avatar.webp')) return res.json({ data: null });
    res.json({ data: await signedPicture(`${req.user.id}/avatar.webp`) });
  });

  app.delete('/api/profile-picture', async (req, res) => {
    const { error } = await supabase.storage.from(bucket).remove([`${req.user.id}/avatar.webp`]);
    if (error) throw fail(502, 'Could not remove the profile picture. Please try again.');
    res.json({ data: null });
  });

  app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
  app.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
      return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
        error: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MiB or smaller.' : 'Send exactly one file in the avatar field and no extra fields.',
      });
    }
    const status = err.status || 500;
    if (status >= 500) logger.error('Profile picture request failed:', err.message);
    res.status(status).json({ error: status === 500 ? 'Internal server error.' : err.message });
  });
  return app;
}


