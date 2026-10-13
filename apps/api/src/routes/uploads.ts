import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { FastifyPluginAsync } from 'fastify';
import { notFound } from '../lib/errors';
import { CONTENT_TYPES, UPLOAD_MAX_BYTES, UPLOAD_MIME, saveImage, uploadPath } from '../lib/uploads';

/** Ochiq: yuklangan rasmlarni berish. Fayl nomi tasodifiy va o'zgarmas — uzoq kesh xavfsiz */
export const uploadPublicRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { name: string } }>('/:name', async (req, reply) => {
    const path = uploadPath(req.params.name);
    const info = path ? await stat(path).catch(() => null) : null;
    if (!path || !info?.isFile()) return notFound('Rasm');
    const ext = req.params.name.split('.').pop() as keyof typeof CONTENT_TYPES;
    return reply
      .header('Content-Type', CONTENT_TYPES[ext])
      .header('Content-Length', info.size)
      .header('Cache-Control', 'public, max-age=31536000, immutable')
      .header('X-Content-Type-Options', 'nosniff')
      .send(createReadStream(path));
  });
};

/** Admin: rasm yuklash. Body — xom fayl (multipart emas), Content-Type: image/jpeg|png|webp */
export const uploadAdminRoutes: FastifyPluginAsync = async (app) => {
  app.addContentTypeParser([...UPLOAD_MIME], { parseAs: 'buffer', bodyLimit: UPLOAD_MAX_BYTES }, (_req, body, done) => done(null, body));

  app.post('/', { bodyLimit: UPLOAD_MAX_BYTES }, async (req, reply) => {
    if (!Buffer.isBuffer(req.body)) {
      reply.code(415);
      return { message: 'Faqat JPG, PNG yoki WEBP rasm yuklash mumkin' };
    }
    reply.code(201);
    return { name: await saveImage(req.body) };
  });
};
