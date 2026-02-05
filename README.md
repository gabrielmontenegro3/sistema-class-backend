# sistema-class backend (API)

API básica em **Node + Express + TypeScript**, conectada ao **Supabase**.

## Ajuda rápida

- Leia `TROUBLESHOOTING.md` para erros comuns (frontend ↔ backend).
- Leia `TESTES.md` para o fluxo de criação/aplicação de testes.
- Leia `AGENDA.md` para o fluxo de Agenda/Atividades.
- Leia `LEITURA.md` para o fluxo de Leitura/Resumo/Avaliações.
- Leia `DICIONARIO.md` para o fluxo de Dicionário/Tentativas/Avaliações.

## Como rodar (Windows / PowerShell)

1) Instale dependências:

```bash
npm install
```

2) Crie seu `.env` na raiz (ou copie do exemplo):

```bash
Copy-Item .env.example .env
```

3) Edite o `.env` (importante):

- **SUPABASE_URL**: a URL do seu projeto Supabase
- **SUPABASE_KEY**: sua chave **anon/publishable** (precisa de RLS/policies corretas) **OU**
- **SUPABASE_SERVICE_ROLE_KEY**: chave service role (recomendado para backend, mas é sensível)

### Segurança (faça agora se você já expôs chaves)

Se você colou chaves em chat/repo, considere **comprometidas**.

- No Supabase: **Project Settings → API → Rotate keys**
- Atualize seu `.env` com as novas chaves
- Reinicie `npm run dev`

4) Rode em dev:

```bash
npm run dev
```

Se a porta `3333` estiver ocupada:

- O servidor agora **tenta automaticamente** as próximas portas (3334, 3335, ...) até subir.
- Ou rode fixando uma porta específica:

```powershell
$env:PORT=3334; npm run dev
```

Ou usando script pronto:

```bash
npm run dev:3334
```

Saúde:
- `GET http://localhost:3333/health`

Base da API:
- `http://localhost:3333/api`

## Regras importantes (para sua IA do frontend)

- **Nunca coloque a Service Role Key no frontend.** Ela é “admin” no seu Supabase.
- Se o backend usar **SUPABASE_KEY (anon/publishable)**, então suas tabelas precisam de **RLS** e **policies** permitindo as operações necessárias.
- Se você tentar usar `/api/...` sem configurar `SUPABASE_KEY`/`SUPABASE_SERVICE_ROLE_KEY`, a API vai responder erro indicando variável ausente.
- Todos os endpoints retornam JSON no formato:
  - sucesso: `{ ok: true, data: ... }`
  - erro: `{ ok: false, error: { message, details? } }`

## Endpoints (CRUD)

Todos os recursos abaixo possuem:

- `GET /api/<recurso>`: lista (aceita filtros simples por querystring, ex. `?agenda_id=...`)
- `GET /api/<recurso>/:id`: detalhe
- `POST /api/<recurso>`: cria (body JSON)
- `PATCH /api/<recurso>/:id`: atualiza parcial (body JSON)
- `DELETE /api/<recurso>/:id`: remove

### Recursos

- **usuarios**: `/api/usuarios`
- **agenda**: `/api/agenda`
- **atividades**: `/api/atividades`
- **resumos**: `/api/resumos`
- **leituras**: `/api/leituras`
- **leitura-avaliacoes**: `/api/leitura-avaliacoes`
- **testes**: `/api/testes`
- **teste-questoes**: `/api/teste-questoes`
- **teste-respostas**: `/api/teste-respostas`
- **dicionario**: `/api/dicionario`
- **dicionario-tentativas**: `/api/dicionario-tentativas`
- **dicionario-avaliacoes**: `/api/dicionario-avaliacoes`

## Endpoints “nested” (por relacionamento)

### Agenda -> Atividades

- `GET /api/agenda/:id/atividades`
- `POST /api/agenda/:id/atividades` (body sem `agenda_id`; o backend injeta)

### Leituras -> Avaliações

- `GET /api/leituras/:id/avaliacoes`
- `POST /api/leituras/:id/avaliacoes` (body sem `leitura_id`; o backend injeta)

### Testes -> Questões e Respostas

- `GET /api/testes/:id/questoes`
- `POST /api/testes/:id/questoes` (body sem `teste_id`)
- `GET /api/testes/:id/respostas`
- `POST /api/testes/:id/respostas` (body sem `teste_id`)

### Dicionário -> Tentativas

- `GET /api/dicionario/:id/tentativas`
- `POST /api/dicionario/:id/tentativas` (body sem `palavra_id`)

### Tentativas -> Avaliações

- `GET /api/dicionario-tentativas/:id/avaliacoes`
- `POST /api/dicionario-tentativas/:id/avaliacoes` (body sem `tentativa_id`)

## Exemplos de uso (fetch)

### Criar usuário

```js
await fetch('http://localhost:3333/api/usuarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nome: 'Ana' })
});
```

### Listar atividades de uma agenda

```js
await fetch(`http://localhost:3333/api/agenda/${agendaId}/atividades`);
```

### Filtrar por FK (querystring)

```js
await fetch(`http://localhost:3333/api/atividades?agenda_id=${agendaId}`);
```

## Build/produção

```bash
npm run build
npm start
```

## Deploy na Vercel (Serverless)

Este repositório suporta deploy como **Vercel Functions** via `api/[...path].ts`.

- **Variáveis de ambiente (Vercel Project → Settings → Environment Variables)**:
  - `SUPABASE_URL` (opcional se você usar a default do projeto, mas recomendado configurar)
  - `SUPABASE_SERVICE_ROLE_KEY` (recomendado para backend) **ou** `SUPABASE_KEY`
- **Rotas**:
  - funciona com `/api/...` (ex.: `/api/usuarios`)
  - e também com `/<recurso>` por rewrite (ex.: `/usuarios`)
  - health: `/health` (ou `/api/health`)

Se aparecer “This Serverless Function has crashed”, veja os logs em **Vercel → Deployments → (seu deploy) → Functions/Logs**.

