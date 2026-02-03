import { Router } from 'express';
import { createCrudRouter } from './_crud';
import { asyncHandler, fail, ok } from '../http';
import { getSupabase } from '../supabase';

export const agendaRouter = Router();

// CRUD base
agendaRouter.use('/', createCrudRouter('agenda'));

// NESTED: atividades da agenda
agendaRouter.get(
  '/:id/atividades',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const r = await supabase.from('atividades').select('*').eq('agenda_id', req.params.id);
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data);
  })
);

agendaRouter.post(
  '/:id/atividades',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const payload = { ...req.body, agenda_id: req.params.id };
    const r = await supabase.from('atividades').insert(payload).select('*').single();
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data, 201);
  })
);

