import { Router } from 'express';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { getSupabase } from '../supabase';
import { asyncHandler, fail, ok } from '../http';

type TableName =
  | 'usuarios'
  | 'agenda'
  | 'atividades'
  | 'resumos'
  | 'leituras'
  | 'leitura_avaliacoes'
  | 'testes'
  | 'teste_questoes'
  | 'teste_respostas'
  | 'dicionario'
  | 'dicionario_tentativas'
  | 'dicionario_avaliacoes';

function handleSupabaseError(res: any, r: PostgrestSingleResponse<any>) {
  if (r.error) return fail(res, r.error.message, 400, r.error);
  return null;
}

export function createCrudRouter(
  table: TableName,
  opts?: {
    defaultSelect?: string;
    validateCreate?: (body: any) => string | null;
    validateUpdate?: (body: any) => string | null;
  }
) {
  const router = Router();
  const select = opts?.defaultSelect ?? '*';
  const validateCreate = opts?.validateCreate;
  const validateUpdate = opts?.validateUpdate;

  // LIST (supports simple equality filters via querystring)
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const supabase = getSupabase();
      let q = supabase.from(table).select(select);
      for (const [k, v] of Object.entries(req.query)) {
        if (typeof v === 'string' && v.length > 0) q = q.eq(k, v);
      }
      const r = await q;
      const handled = handleSupabaseError(res, r);
      if (handled) return handled;
      return ok(res, r.data);
    })
  );

  // GET by id
  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const supabase = getSupabase();
      const r = await supabase.from(table).select(select).eq('id', req.params.id).single();
      const handled = handleSupabaseError(res, r);
      if (handled) return handled;
      return ok(res, r.data);
    })
  );

  // CREATE
  router.post(
    '/',
    asyncHandler(async (req, res) => {
      if (validateCreate) {
        const msg = validateCreate(req.body);
        if (msg) return fail(res, msg, 400);
      }
      const supabase = getSupabase();
      const r = await supabase.from(table).insert(req.body).select(select).single();
      const handled = handleSupabaseError(res, r);
      if (handled) return handled;
      return ok(res, r.data, 201);
    })
  );

  // UPDATE (partial)
  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      if (validateUpdate) {
        const msg = validateUpdate(req.body);
        if (msg) return fail(res, msg, 400);
      }
      const supabase = getSupabase();
      const r = await supabase.from(table).update(req.body).eq('id', req.params.id).select(select).single();
      const handled = handleSupabaseError(res, r);
      if (handled) return handled;
      return ok(res, r.data);
    })
  );

  // DELETE
  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const supabase = getSupabase();
      const r = await supabase.from(table).delete().eq('id', req.params.id).select('id').single();
      const handled = handleSupabaseError(res, r);
      if (handled) return handled;
      return ok(res, r.data);
    })
  );

  return router;
}

