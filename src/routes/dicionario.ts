import { Router } from 'express';
import { createCrudRouter } from './_crud';
import { asyncHandler, fail, ok } from '../http';
import { getSupabase } from '../supabase';

export const dicionarioRouter = Router();

dicionarioRouter.use('/', createCrudRouter('dicionario'));

// NESTED: tentativas para a palavra
dicionarioRouter.get(
  '/:id/tentativas',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const r = await supabase.from('dicionario_tentativas').select('*').eq('palavra_id', req.params.id);
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data);
  })
);

dicionarioRouter.post(
  '/:id/tentativas',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const payload = { ...req.body, palavra_id: req.params.id };
    const r = await supabase.from('dicionario_tentativas').insert(payload).select('*').single();
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data, 201);
  })
);

