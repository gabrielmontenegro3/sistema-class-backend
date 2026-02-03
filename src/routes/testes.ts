import { Router } from 'express';
import { createCrudRouter } from './_crud';
import { asyncHandler, fail, ok } from '../http';
import { getSupabase } from '../supabase';

export const testesRouter = Router();

testesRouter.use('/', createCrudRouter('testes'));

// NESTED: questões do teste
testesRouter.get(
  '/:id/questoes',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const r = await supabase.from('teste_questoes').select('*').eq('teste_id', req.params.id);
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data);
  })
);

testesRouter.post(
  '/:id/questoes',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const payload = { ...req.body, teste_id: req.params.id };
    const r = await supabase.from('teste_questoes').insert(payload).select('*').single();
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data, 201);
  })
);

// NESTED: respostas do teste
testesRouter.get(
  '/:id/respostas',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const r = await supabase.from('teste_respostas').select('*').eq('teste_id', req.params.id);
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data);
  })
);

testesRouter.post(
  '/:id/respostas',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const payload = { ...req.body, teste_id: req.params.id };
    const r = await supabase.from('teste_respostas').insert(payload).select('*').single();
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data, 201);
  })
);

