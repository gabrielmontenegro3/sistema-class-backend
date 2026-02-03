# Guia — Testes (como criar, listar questões e registrar respostas)

Este guia explica como funciona o fluxo de **Testes** no seu sistema usando a API atual.

## Entidades envolvidas

### 1) `testes`
Representa “a prova” (título + data).

Campos:
- `id` (uuid)
- `titulo` (string)
- `data` (date)

### 2) `teste_questoes`
Questões pertencentes a um teste.

Campos:
- `id` (uuid)
- `teste_id` (uuid) → FK para `testes.id`
- `enunciado` (text)
- `resposta_correta` (text)

### 3) `teste_respostas`
Cada registro representa **a resposta de um usuário para uma questão**.

Campos:
- `id` (uuid)
- `teste_id` (uuid) → FK para `testes.id`
- `questao_id` (uuid) → FK para `teste_questoes.id`
- `usuario_id` (uuid) → FK para `usuarios.id`
- `resposta_usuario` (text)
- `correta` (boolean)

## Fluxo recomendado (para a IA do frontend)

### Passo A — Criar o teste

Endpoint:
- `POST /api/testes`

Body:
```json
{ "titulo": "Prova de Matemática", "data": "2026-02-10" }
```

Retorno: objeto do teste (com `id`).

### Passo B — Cadastrar questões do teste

Endpoint (recomendado):
- `POST /api/testes/:testeId/questoes`

Body:
```json
{ "enunciado": "Quanto é 2+2?", "resposta_correta": "4" }
```

Importante (gabarito opcional):
- No **produto**, `resposta_correta` pode ser **opcional** (ex.: prova discursiva, correção manual).
- Para isso funcionar, seu banco precisa permitir `NULL` em `teste_questoes.resposta_correta`.
- Se hoje estiver dando erro de `NOT NULL`, rode este SQL no Supabase:

```sql
ALTER TABLE teste_questoes
ALTER COLUMN resposta_correta DROP NOT NULL;
```

Repita para cada questão.

Também existe CRUD direto:
- `POST /api/teste-questoes` com `{ teste_id, enunciado, resposta_correta? }`

### Passo C — Listar questões para aplicar o teste no frontend

Endpoint:
- `GET /api/testes/:testeId/questoes`

Retorna um array de questões.  
Observação: a resposta correta também vem (porque está no banco). **Se você não quiser expor a resposta correta para o cliente**, você deve criar uma rota “publica” que omite esse campo (melhoria futura).

### Passo D — Usuário responde e o frontend registra as respostas

Você tem duas formas:

#### Opção D1 (mais simples) — Registrar cada resposta (1 request por questão)

Endpoint:
- `POST /api/testes/:testeId/respostas`

Body:
```json
{
  "questao_id": "UUID_DA_QUESTAO",
  "usuario_id": "UUID_DO_USUARIO",
  "resposta_usuario": "4",
  "correta": true
}
```

Como preencher `correta`?
- **Hoje o backend não corrige automaticamente**.
- Então você pode:
  - **(A)** Corrigir no frontend comparando `resposta_usuario` com `resposta_correta` (mas isso exige que você tenha `resposta_correta` no cliente), ou
  - **(B)** Não enviar `correta` e depois um professor/avaliador preencher (mas sua tabela permite `correta` nulo? hoje é boolean sem NOT NULL, então pode ficar nulo).

#### Opção D2 — Registrar respostas via CRUD direto

- `POST /api/teste-respostas`

Body:
```json
{
  "teste_id": "UUID_DO_TESTE",
  "questao_id": "UUID_DA_QUESTAO",
  "usuario_id": "UUID_DO_USUARIO",
  "resposta_usuario": "4",
  "correta": true
}
```

## “Tentativas” (importante)

No seu banco **não existe** uma tabela/coluna específica para “tentativa” de teste (por exemplo `tentativa_id` ou `created_at` em `teste_respostas`).

### Como funciona com o schema atual

- Cada envio do usuário gera linhas em `teste_respostas`.
- Se o usuário “tentar de novo”, você terá que decidir:
  - **Sobrescrever** respostas antigas (ex.: deletar as anteriores e inserir novas)
  - **Permitir múltiplas tentativas** inserindo novas linhas (mas depois fica difícil separar qual conjunto pertence a qual tentativa, porque não há um agrupador/horário)

### Recomendação (melhoria pequena para suportar tentativas de verdade)

Se você quiser suportar “tentativas” corretamente, o ideal é adicionar:
- Em `teste_respostas`: `created_at TIMESTAMP DEFAULT NOW()`
- E/ou um `tentativa_id UUID` (mesmo valor para todas as respostas de uma tentativa)

Assim o frontend consegue:
- listar “minhas tentativas”
- pegar a “última tentativa”
- calcular nota por tentativa

## Consultas úteis (via filtros)

Listar respostas de um usuário em um teste:
- `GET /api/teste-respostas?teste_id=<id>&usuario_id=<id>`

Listar respostas de um teste:
- `GET /api/testes/:testeId/respostas`

