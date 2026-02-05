import { Router } from 'express';
import { createCrudRouter } from './_crud';
import { asyncHandler, fail, ok } from '../http';
import { getSupabase } from '../supabase';

export const dicionarioRouter = Router();

dicionarioRouter.use('/', createCrudRouter('dicionario'));

function normalizeGuess(v: unknown) {
  if (typeof v !== 'string') return null;
  // lower + trim + remove accents/diacritics + collapse spaces
  return v
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function pickFirstStringField(obj: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim().length > 0) return { key: k, value: v };
  }
  return null;
}

async function insertTentativaWithFallback(
  supabase: ReturnType<typeof getSupabase>,
  payload: Record<string, unknown>
) {
  // tenta inserir com o payload completo; se o banco reclamar de coluna inexistente,
  // remove essa coluna e tenta novamente (para tolerar variações de schema).
  const working: Record<string, unknown> = { ...payload };
  for (let i = 0; i < 6; i++) {
    const r = await supabase.from('dicionario_tentativas').insert(working).select('*').single();
    if (!r.error) return r;

    const msg = r.error.message ?? '';
    const m =
      msg.match(/column "([^"]+)" of relation "[^"]+" does not exist/i) ??
      msg.match(/Could not find the '([^']+)' column/i);

    if (!m) return r;
    const col = m[1];
    if (!(col in working)) return r;
    delete working[col];
  }

  return await supabase.from('dicionario_tentativas').insert(payload).select('*').single();
}

// TENTAR (recomendado): backend corrige e registra a tentativa
// POST /api/dicionario/:id/tentar
// Body: { usuario_id, tentativa | resposta_usuario | resposta | palavra }
dicionarioRouter.post(
  '/:id/tentar',
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const palavraId = req.params.id;

    const body = req.body ?? {};
    const usuarioId = body.usuario_id;
    if (!usuarioId) return fail(res, 'Campo obrigatório: usuario_id', 400);

    const guessField = pickFirstStringField(body, [
      'tentativa',
      'significado_usuario',
      'resposta_usuario',
      'resposta',
      'palavra'
    ]);
    if (!guessField)
      return fail(res, 'Campo obrigatório: tentativa (ou significado_usuario/resposta_usuario/resposta/palavra)', 400);

    const guessNorm = normalizeGuess(guessField.value);
    if (!guessNorm) return fail(res, 'Campo inválido: tentativa', 400);

    const palavraR = await supabase.from('dicionario').select('*').eq('id', palavraId).single();
    if (palavraR.error) return fail(res, palavraR.error.message, 400, palavraR.error);

    const palavraObj = (palavraR.data ?? {}) as Record<string, unknown>;
    const correctField = pickFirstStringField(palavraObj, ['palavra', 'termo', 'resposta', 'word', 'nome', 'titulo']);
    if (!correctField) {
      return fail(
        res,
        'Não foi possível determinar a palavra correta no registro de dicionario (esperado um campo como: palavra/termo/resposta).',
        400,
        { availableKeys: Object.keys(palavraObj) }
      );
    }

    const correctNorm = normalizeGuess(correctField.value);
    if (!correctNorm) return fail(res, 'Palavra correta inválida no banco.', 400, { field: correctField.key });

    const correta = guessNorm === correctNorm;

    // payload "ideal" (se o schema tiver essas colunas)
    const tentativaPayload: Record<string, unknown> = {
      palavra_id: palavraId,
      usuario_id: usuarioId,
      correta,
      // tenta gravar o palpite do usuário em colunas comuns
      tentativa: guessField.value,
      significado_usuario: guessField.value,
      resposta_usuario: guessField.value,
      resposta: guessField.value
    };

    const ins = await insertTentativaWithFallback(supabase, tentativaPayload);
    if (ins.error) return fail(res, ins.error.message, 400, ins.error);

    return ok(res, { ...ins.data, correta }, 201);
  })
);

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
    const palavraId = req.params.id;
    const body = req.body ?? {};

    // Mantém compatibilidade: permite inserir "cru" via nested,
    // mas quando houver tentativa + for possível descobrir a palavra correta,
    // já calcula `correta` no backend.
    const payload: Record<string, unknown> = { ...body, palavra_id: palavraId };

    const guessField = pickFirstStringField(body, [
      'tentativa',
      'significado_usuario',
      'resposta_usuario',
      'resposta',
      'palavra'
    ]);
    if (guessField) {
      const guessNorm = normalizeGuess(guessField.value);
      if (guessNorm) {
        const palavraR = await supabase.from('dicionario').select('*').eq('id', palavraId).single();
        if (!palavraR.error) {
          const palavraObj = (palavraR.data ?? {}) as Record<string, unknown>;
          const correctField = pickFirstStringField(palavraObj, [
            'palavra',
            'termo',
            'resposta',
            'word',
            'nome',
            'titulo'
          ]);
          const correctNorm = correctField ? normalizeGuess(correctField.value) : null;
          if (correctNorm) payload.correta = guessNorm === correctNorm;
        }
      }
    }

    const r = await insertTentativaWithFallback(supabase, payload);
    if (r.error) return fail(res, r.error.message, 400, r.error);
    return ok(res, r.data, 201);
  })
);

