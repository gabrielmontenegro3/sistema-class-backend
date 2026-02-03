import { Router } from 'express';
import { usuariosRouter } from './usuarios';
import { agendaRouter } from './agenda';
import { atividadesRouter } from './atividades';
import { resumosRouter } from './resumos';
import { leiturasRouter } from './leituras';
import { leituraAvaliacoesRouter } from './leitura_avaliacoes';
import { testesRouter } from './testes';
import { testeQuestoesRouter } from './teste_questoes';
import { testeRespostasRouter } from './teste_respostas';
import { dicionarioRouter } from './dicionario';
import { dicionarioTentativasRouter } from './dicionario_tentativas';
import { dicionarioAvaliacoesRouter } from './dicionario_avaliacoes';

export const router = Router();

router.use('/usuarios', usuariosRouter);
router.use('/agenda', agendaRouter);
router.use('/atividades', atividadesRouter);
router.use('/resumos', resumosRouter);
router.use('/leituras', leiturasRouter);
router.use('/leitura-avaliacoes', leituraAvaliacoesRouter);
router.use('/testes', testesRouter);
router.use('/teste-questoes', testeQuestoesRouter);
router.use('/teste-respostas', testeRespostasRouter);
router.use('/dicionario', dicionarioRouter);
router.use('/dicionario-tentativas', dicionarioTentativasRouter);
router.use('/dicionario-avaliacoes', dicionarioAvaliacoesRouter);

