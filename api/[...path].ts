import { createApp } from '../src/app';

// Express app é um handler compatível com Vercel Functions (req, res).
// Importante: NÃO chamar app.listen() aqui.
const app = createApp();

export default function handler(req: any, res: any) {
  // A Vercel pode injetar helpers em `req` (ex.: `req.body` como getter).
  // O `express.json()` precisa atribuir `req.body = ...`; se `body` não for gravável,
  // isso pode causar exceção e derrubar a Function.
  try {
    Object.defineProperty(req, 'body', {
      value: req.body,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch {
    // se falhar, seguimos e deixamos logs da Vercel apontarem o motivo
  }

  // Quando a Function é montada em /api/*, a Vercel mantém esse prefixo no req.url.
  // Nosso Express está preparado para rotas em "/" (ex.: /health), então normalizamos.
  const url: string = req?.url ?? '';
  if (url === '/api' || url.startsWith('/api/')) {
    const next = url.slice('/api'.length);
    req.url = next.length ? next : '/';
  }
  return app(req, res);
}

