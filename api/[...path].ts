import { createApp } from '../src/app';

// Express app é um handler compatível com Vercel Functions (req, res).
// Importante: NÃO chamar app.listen() aqui.
const app = createApp();

export default function handler(req: any, res: any) {
  // Quando a Function é montada em /api/*, a Vercel mantém esse prefixo no req.url.
  // Nosso Express está preparado para rotas em "/" (ex.: /health), então normalizamos.
  const url: string = req?.url ?? '';
  if (url === '/api' || url.startsWith('/api/')) {
    const next = url.slice('/api'.length);
    req.url = next.length ? next : '/';
  }
  return app(req, res);
}

