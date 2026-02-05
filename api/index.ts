import type { IncomingMessage, ServerResponse } from 'http';
import app from '../src/app';

// Catch-all via rewrite para `/api?path=<...>` (ver `vercel.json`)
export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  // Tornar `req.body` gravável (Vercel pode injetar helpers como getters)
  try {
    Object.defineProperty(req as any, 'body', {
      value: (req as any).body,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch {
    // ignore
  }

  // A Vercel também pode injetar `req.query` como helper (objeto),
  // mas no Express `req.query` é um getter calculado a partir de `req.url`.
  // Se existir um "own property" `query`, ele sombreia o getter do Express e
  // pode vazar parâmetros internos (ex.: `path`) para a aplicação.
  try {
    if (Object.prototype.hasOwnProperty.call(req as any, 'query')) {
      delete (req as any).query;
    }
  } catch {
    // ignore
  }

  const rawUrl = req.url ?? '/';
  const u = new URL(rawUrl, 'http://localhost');
  const p = u.searchParams.get('path') ?? '';
  u.searchParams.delete('path');

  const qs = u.searchParams.toString();
  const nextPath = `/${p}`.replace(/^\/+/, '/'); // garante 1 slash
  req.url = nextPath + (qs ? `?${qs}` : '');

  return (app as any)(req, res);
}

