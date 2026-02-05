# Guia — Dicionário (palavra → tentativas → avaliações)

Guia curto para sua IA do frontend implementar a funcionalidade **Dicionário**: o usuário faz **tentativas de acertar uma palavra**.

## Base URL

Use preferencialmente:
- `http://localhost:3333/api`

(Compatível também sem `/api`: `http://localhost:3333`)

## Tabelas e intenção

### `dicionario`
Um registro de “palavra alvo” (o que o usuário deve acertar).

Campos variam conforme seu Supabase, mas o backend tenta usar como “palavra correta” o **primeiro** campo string existente nesta ordem:
- `palavra`, `termo`, `resposta`, `word`, `nome`, `titulo`

Recomendação de schema (para evitar ambiguidades):
- `palavra` (**obrigatório**) — a palavra correta
- `dica` (opcional) — uma dica/descrição

### `dicionario_tentativas`
Cada registro é **uma tentativa** de um usuário para uma palavra do dicionário.

Campos esperados/recomendados:
- `palavra_id` (**obrigatório**) — FK para `dicionario.id`
- `usuario_id` (**obrigatório**) — FK para `usuarios.id`
- `correta` (boolean) — se acertou
- `tentativa` (text) — o que o usuário digitou
- `significado_usuario` (text) — (se existir no seu schema) o que o usuário digitou

Observação: o backend tem fallback para tolerar variações de coluna (ex.: `significado_usuario` / `resposta_usuario` / `resposta` em vez de `tentativa`).

### `dicionario_avaliacoes`
Avaliações de uma tentativa (se você tiver correção manual/feedback).

Campos típicos:
- `tentativa_id` (**obrigatório**) — FK para `dicionario_tentativas.id`
- `usuario_id` (**obrigatório**) — quem avaliou
- `nota` (0 a 10) e/ou `comentario` (opcionais)

## Fluxo recomendado (frontend)

### 1) Criar/cadastrar a palavra do dicionário

`POST /dicionario`

Body (exemplo recomendado):
```json
{ "palavra": "abacaxi", "dica": "Fruta tropical" }
```

Retorno: objeto com `id`.

### 2) Mostrar a palavra (sem expor resposta)

Recomendação de produto: **não exibir a palavra correta** no cliente.  
Se você estiver usando o `GET /dicionario/:id` padrão, ele pode retornar o campo `palavra` (porque é CRUD).

Opções:
- (A) aceitar isso no protótipo, ou
- (B) criar no futuro um endpoint “público” que omite `palavra` e retorna só `dica`.

### 3) Usuário tenta acertar (rota recomendada)

`POST /dicionario/:palavraId/tentar`

Body:
```json
{
  "usuario_id": "UUID_DO_USUARIO",
  "significado_usuario": "Abacaxi"
}
```

Também aceita, em vez de `tentativa`, um destes campos:
- `tentativa` **ou** `resposta_usuario` **ou** `resposta` **ou** `palavra`

Retorno:
- `201` com o registro inserido em `dicionario_tentativas` (incluindo `correta`)

### 4) Listar tentativas daquela palavra (para histórico/placar)

`GET /dicionario/:palavraId/tentativas`

### 5) Avaliar uma tentativa (opcional)

`POST /dicionario-tentativas/:tentativaId/avaliacoes`

Body (exemplo):
```json
{
  "usuario_id": "UUID_DO_AVALIADOR",
  "nota": 10,
  "comentario": "Acertou e escreveu corretamente."
}
```

## Endpoints (resumo)

### Dicionário (CRUD)
- `GET /dicionario`
- `GET /dicionario/:id`
- `POST /dicionario`
- `PATCH /dicionario/:id`
- `DELETE /dicionario/:id`

### Tentativas (CRUD)
- `GET /dicionario-tentativas` (filtre: `?palavra_id=<id>` / `?usuario_id=<id>`)
- `GET /dicionario-tentativas/:id`
- `POST /dicionario-tentativas` (precisa `palavra_id`)
- `PATCH /dicionario-tentativas/:id`
- `DELETE /dicionario-tentativas/:id`

### Nested
- `GET /dicionario/:id/tentativas`
- `POST /dicionario/:id/tentativas` (insere tentativa; **tenta** preencher `correta` automaticamente se conseguir)

### Rota recomendada (corrige no backend)
- `POST /dicionario/:id/tentar` (**corrige e grava** `correta`)

### Avaliações
- `GET /dicionario-avaliacoes`
- `POST /dicionario-avaliacoes`
- `GET /dicionario-tentativas/:id/avaliacoes`
- `POST /dicionario-tentativas/:id/avaliacoes`

