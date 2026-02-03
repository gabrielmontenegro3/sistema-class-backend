import type { NextFunction, Request, Response } from 'express';

export type ApiError = {
  message: string;
  details?: unknown;
};

export function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function fail(res: Response, message: string, status = 400, details?: unknown) {
  const payload: ApiError = { message, details };
  return res.status(status).json({ ok: false, error: payload });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const isMissingSupabaseKey =
    typeof message === 'string' &&
    (message.includes('Missing SUPABASE_KEY') || message.includes('Missing SUPABASE_SERVICE_ROLE_KEY'));

  // não vazar stack por padrão
  const includeDetails = process.env.NODE_ENV === 'development' && !isMissingSupabaseKey;
  const details = includeDetails && err instanceof Error ? err.stack : undefined;

  const status = isMissingSupabaseKey ? 503 : 500;
  return res.status(status).json({ ok: false, error: { message, details } });
}

