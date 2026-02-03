import { Router } from 'express';
import { createCrudRouter } from './_crud';
import { asyncHandler, fail, ok } from '../http';
import { getSupabase } from '../supabase';

export const leiturasRouter = Router();

leiturasRouter.use('/', createCrudRouter('leituras'));

// NESTED: avaliações da leitura
leiturasRouter.get(
  '/:id/avaliacoes',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const r = await supabase.from('leitura_avaliacoes').select('*').eq('leitura_id', req.params.id);
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data);
  })
);

leiturasRouter.post(
  '/:id/avaliacoes',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const payload = { ...req.body, leitura_id: req.params.id };
    const r = await supabase.from('leitura_avaliacoes').insert(payload).select('*').single();
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data, 201);
  })
);

