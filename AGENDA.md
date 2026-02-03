# Guia — Agenda (criar dia + atividades)

Guia sucinto para sua IA do frontend implementar a funcionalidade **Agenda**.

## Base URL

Use preferencialmente:
- `http://localhost:3333/api`

(Compatível também sem `/api`: `http://localhost:3333`)

## Tabelas

### `agenda`
Campos relevantes:
- `dia` (**obrigatório**, `YYYY-MM-DD`)
- `anotou` (boolean, default `false`)

### `atividades`
Campos relevantes:
- `agenda_id` (**obrigatório**; ao usar rota nested ele é injetado)
- `materia` (**obrigatório**)
- `conteudo` (**obrigatório**)
- `data_entrega` (opcional, `YYYY-MM-DD`)
- `feita` (boolean, default `false`)

## Fluxo recomendado (frontend)

### 1) Criar um dia na agenda

`POST /agenda`

Body:
```json
{ "dia": "2026-02-02" }
```

Retorna o registro criado (com `id`).

### 2) Listar agenda (ex.: por dia)

`GET /agenda?dia=2026-02-02`

Observação: os filtros são por igualdade via querystring.

### 3) Marcar como “anotou”

`PATCH /agenda/:agendaId`

Body:
```json
{ "anotou": true }
```

### 4) Criar atividade vinculada ao dia (rota nested)

`POST /agenda/:agendaId/atividades`

Body:
```json
{
  "materia": "Matemática",
  "conteudo": "Lista 3, exercícios 1-10",
  "data_entrega": "2026-02-05"
}
```

> Não envie `agenda_id` aqui; o backend injeta automaticamente.

### 5) Listar atividades do dia (rota nested)

`GET /agenda/:agendaId/atividades`

### 6) Marcar atividade como feita

`PATCH /atividades/:atividadeId`

Body:
```json
{ "feita": true }
```

## Endpoints (resumo)

### Agenda (CRUD)
- `GET /agenda`
- `GET /agenda/:id`
- `POST /agenda`
- `PATCH /agenda/:id`
- `DELETE /agenda/:id`

### Atividades (CRUD)
- `GET /atividades` (filtre por `agenda_id` se quiser: `?agenda_id=<id>`)
- `GET /atividades/:id`
- `POST /atividades` (precisa `agenda_id`)
- `PATCH /atividades/:id`
- `DELETE /atividades/:id`

### Nested
- `GET /agenda/:id/atividades`
- `POST /agenda/:id/atividades`

