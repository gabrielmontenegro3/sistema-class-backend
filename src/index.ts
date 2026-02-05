import { createApp } from './app';
import { env } from './env';

export const app = createApp();

export function listenWithFallback(startPort: number, attempts: number) {
  const tryListen = (port: number, remaining: number) => {
    const server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`[api] listening on http://localhost:${port}`);
      if (port !== startPort) {
        // eslint-disable-next-line no-console
        console.log(`[api] note: port ${startPort} was busy, using ${port} instead`);
      }
    });

    server.on('error', (err: any) => {
      if (err?.code === 'EADDRINUSE' && remaining > 0) {
        // eslint-disable-next-line no-console
        console.log(`[api] port ${port} in use, trying ${port + 1}...`);
        server.close(() => tryListen(port + 1, remaining - 1));
        return;
      }
      throw err;
    });
  };

  tryListen(startPort, attempts);
}

// Só inicia servidor quando executado diretamente (local/VM).
// Em ambientes serverless (ex.: Vercel), este arquivo pode ser importado como módulo,
// e não devemos abrir porta com app.listen() no "top-level".
if (require.main === module) {
  listenWithFallback(env.PORT, 20);
}

