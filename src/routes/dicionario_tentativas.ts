import { Router } from 'express';
import { createCrudRouter } from './_crud';
import { asyncHandler, fail, ok } from '../http';
import { getSupabase } from '../supabase';

export const dicionarioTentativasRouter = Router();

dicionarioTentativasRouter.use('/', createCrudRouter('dicionario_tentativas'));

// NESTED: avaliações da tentativa
dicionarioTentativasRouter.get(
  '/:id/avaliacoes',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const r = await supabase.from('dicionario_avaliacoes').select('*').eq('tentativa_id', req.params.id);
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data);
  })
);

dicionarioTentativasRouter.post(
  '/:id/avaliacoes',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const payload = { ...req.body, tentativa_id: req.params.id };
    const r = await supabase.from('dicionario_avaliacoes').insert(payload).select('*').single();
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data, 201);
  })
);

