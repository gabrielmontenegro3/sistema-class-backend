# Guia — Leitura (texto → resumo resposta → avaliações)

Guia curto para sua IA do frontend implementar a funcionalidade **Leitura**.

## Base URL

Use preferencialmente:
- `http://localhost:3333/api`

(Compatível também sem `/api`: `http://localhost:3333`)

## Tabelas e intenção

### `leituras`
Um registro de leitura.

Campos relevantes:
- `texto` (**obrigatório**) — o texto a ser lido
- `resumo_resposta` (opcional) — resposta/resumo produzido por outro usuário (ex.: Davi)

### `leitura_avaliacoes`
Avaliações do `resumo_resposta` de uma leitura.

Campos relevantes:
- `leitura_id` (**obrigatório**) — FK para `leituras.id`
- `usuario_id` (**obrigatório**) — quem avaliou
- `nota` (0 a 10) — validação no banco
- `comentario` (opcional)
- `created_at` (auto)

## Fluxo recomendado (frontend)

### 1) Usuário A cria a leitura (o “registro”)

`POST /leituras`

Body:
```json
{ "texto": "Cole aqui o texto da leitura..." }
```

Retorno: objeto com `id`.

### 2) Usuário Davi adiciona o resumo/resposta

Atualize o campo `resumo_resposta` da leitura:

`PATCH /leituras/:leituraId`

Body:
```json
{ "resumo_resposta": "Resumo/resposta do Davi..." }
```

### 3) Outros usuários avaliam (nota + comentário)

Endpoint (recomendado):

`POST /leituras/:leituraId/avaliacoes`

Body:
```json
{
  "usuario_id": "UUID_DO_AVALIADOR",
  "nota": 9,
  "comentario": "Boa síntese, mas faltou citar X."
}
```

Regras:
- `nota` deve estar entre **0 e 10**.
- `usuario_id` deve existir em `usuarios`.

### 4) Listar avaliações da leitura (para mostrar no frontend)

`GET /leituras/:leituraId/avaliacoes`

Opcional: calcular média no frontend:
- \(media = soma(nota) / quantidade\)

### 5) Listar leituras (feed)

`GET /leituras`

Filtrar se necessário (ex.: por id):
- `GET /leituras?id=<uuid>`

## Endpoints (resumo)

### Leituras (CRUD)
- `GET /leituras`
- `GET /leituras/:id`
- `POST /leituras` (**texto** obrigatório)
- `PATCH /leituras/:id` (ex.: definir `resumo_resposta`)
- `DELETE /leituras/:id`

### Avaliações (CRUD)
- `GET /leitura-avaliacoes` (filtre: `?leitura_id=<id>` / `?usuario_id=<id>`)
- `GET /leitura-avaliacoes/:id`
- `POST /leitura-avaliacoes` (precisa `leitura_id` + `usuario_id` + `nota`)
- `PATCH /leitura-avaliacoes/:id`
- `DELETE /leitura-avaliacoes/:id`

### Nested (recomendado)
- `GET /leituras/:id/avaliacoes`
- `POST /leituras/:id/avaliacoes`

