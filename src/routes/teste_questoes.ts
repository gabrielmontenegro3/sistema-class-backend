import { createCrudRouter } from './_crud';

// resposta_correta é opcional no produto (pode ser corrigida depois),
// mas para funcionar de verdade o banco precisa permitir NULL na coluna.
export const testeQuestoesRouter = createCrudRouter('teste_questoes', {
  validateCreate: (body: any) => {
    if (!body) return 'Body JSON é obrigatório.';
    if (!body.teste_id) return 'Campo obrigatório: teste_id';
    if (!body.enunciado) return 'Campo obrigatório: enunciado';
    return null;
  },
  validateUpdate: (body: any) => {
    if (!body) return 'Body JSON é obrigatório.';
    if ('enunciado' in body && !body.enunciado) return 'Campo inválido: enunciado';
    return null;
  }
});

