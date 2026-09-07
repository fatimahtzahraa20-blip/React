import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import sharp from 'sharp';
import { createApp, MAX_FILE_SIZE } from '../src/app.js';
function setup(failure = false) {
  const uploads = [];
  const storage = {
    list: async () => ({ data: [{ name: 'avatar.webp' }], error: null }),
    remove: async paths => { uploads.push(paths); return { error: failure ? new Error('secret') : null }; },
    upload: async (...args) => { uploads.push(args); return { error: failure ? new Error('secret') : null }; },
    createSignedUrl: async () => ({ data: { signedUrl: 'https://example.com/signed' }, error: null }),
  };
  const supabase = { auth: { getUser: async token => ({ data: { user: token === 'valid' ? { id: 'user-123' } : null }, error: null }) }, storage: { from: () => storage } };
  return { app: createApp({ supabase, logger: { error() {} } }), uploads };
}
const picture = await sharp({ create: { width: 20, height: 30, channels: 3, background: 'red' } }).png().toBuffer();
test('requires verified authentication', async () => {
  const { app } = setup();
  await request(app).post('/api/profile-picture').expect(401);
  await request(app).post('/api/profile-picture').set('Authorization', 'Bearer bad').expect(401);
});
test('normalizes uploads and uses authenticated user path', async () => {
  const { app, uploads } = setup();
  const res = await request(app).post('/api/profile-picture').set('Authorization', 'Bearer valid').attach('avatar', picture, 'photo.png').expect(200);
  assert.equal(res.body.data.path, 'user-123/avatar.webp');
  assert.equal(uploads[0][0], 'user-123/avatar.webp');
  assert.equal(uploads[0][2].upsert, true);
  const metadata = await sharp(uploads[0][1]).metadata();
  assert.equal(metadata.format, 'webp'); assert.equal(metadata.width, 512); assert.equal(metadata.height, 512);
});
test('rejects missing files, wrong fields, forged images and oversized files', async () => {
  const { app, uploads } = setup();
  const post = () => request(app).post('/api/profile-picture').set('Authorization', 'Bearer valid');
  await post().expect(400);
  await post().attach('wrong', picture, 'photo.png').expect(400);
  await post().attach('avatar', Buffer.from('fake'), 'photo.png').expect(415);
  await post().attach('avatar', Buffer.from('<svg/>'), 'photo.svg').expect(415);
  await post().attach('avatar', Buffer.alloc(MAX_FILE_SIZE + 1), 'photo.png').expect(413);
  assert.equal(uploads.length, 0);
});
test('does not expose storage errors', async () => {
  const res = await request(setup(true).app).post('/api/profile-picture').set('Authorization', 'Bearer valid').attach('avatar', picture, 'photo.png').expect(502);
  assert.equal(res.body.error, 'Could not upload the profile picture.');
});
test('refreshes signed URL', async () => {
  const res = await request(setup().app).get('/api/profile-picture').set('Authorization', 'Bearer valid').expect(200);
  assert.equal(res.body.data.expiresIn, 3600);
});


test('removes only the authenticated user picture', async () => {
  const { app, uploads } = setup();
  await request(app).delete('/api/profile-picture').expect(401);
  await request(app).delete('/api/profile-picture').set('Authorization', 'Bearer valid').expect(200);
  assert.deepEqual(uploads[0], ['user-123/avatar.webp']);
  await request(setup(true).app).delete('/api/profile-picture').set('Authorization', 'Bearer valid').expect(502);
});
test('returns empty data for a user without an avatar', async () => {
  const supabase = {
    auth: { getUser: async () => ({ data: { user: { id: 'new-user' } } }) },
    storage: { from: () => ({ list: async () => ({ data: [], error: null }) }) },
  };
  const response = await request(createApp({ supabase })).get('/api/profile-picture').set('Authorization', 'Bearer valid').expect(200);
  assert.equal(response.body.data, null);
});
