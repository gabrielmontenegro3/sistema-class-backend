import express from 'express';
import cors from 'cors';
import { errorMiddleware, fail, ok } from './http';
import { router } from './routes';
import { env } from './env';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => ok(res, { status: 'ok' }));
  app.get('/health/config', (_req, res) =>
    ok(res, {
      port: env.PORT,
      supabaseUrl: env.SUPABASE_URL,
      hasSupabaseKey: Boolean(env.SUPABASE_KEY),
      supabaseKeySource: env.SUPABASE_KEY_SOURCE
    })
  );
  // Suporta os dois formatos:
  // - /api/<recurso>  (recomendado)
  // - /<recurso>      (compatível com frontends que não usam prefixo /api)
  app.use('/api', router);
  app.use('/', router);

  // 404 em JSON (evita HTML "Cannot GET ...")
  app.use((req, res) => fail(res, `Route not found: ${req.method} ${req.path}`, 404));

  app.use(errorMiddleware);
  return app;
}

