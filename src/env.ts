import dotenv from 'dotenv';
import path from 'path';

// Carrega .env a partir da raiz do projeto, independente do cwd
// - em dev: __dirname = .../src  => ../.env
// - em prod (dist): __dirname = .../dist => ../.env
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

function cleanEnv(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  if (!t) return undefined;
  // placeholders comuns (tratamos como "não configurado")
  const lower = t.toLowerCase();
  if (
    lower.includes('cole_sua_') ||
    lower.includes('coloque_sua_') ||
    lower.includes('sua_chave') ||
    lower.includes('your_key') ||
    lower.includes('placeholder')
  ) {
    return undefined;
  }
  // remove aspas acidentais no .env: KEY="..." ou KEY='...'
  if (
    (t.startsWith('"') && t.endsWith('"') && t.length >= 2) ||
    (t.startsWith("'") && t.endsWith("'") && t.length >= 2)
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  PORT: Number(cleanEnv(process.env.PORT) ?? 3333),
  SUPABASE_URL:
    cleanEnv(process.env.SUPABASE_URL) ?? 'https://xktplunqgkcfgcdbzvsd.supabase.co',
  // compat: o usuário trouxe SUPABASE_KEY no snippet, então suportamos
  SUPABASE_KEY: cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ?? cleanEnv(process.env.SUPABASE_KEY),
  SUPABASE_KEY_SOURCE: cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? 'service_role'
    : cleanEnv(process.env.SUPABASE_KEY)
      ? 'anon_or_publishable'
      : null,
  _requireEnv: requireEnv
};

if (!env.SUPABASE_KEY) {
  // não crasha no import; crasha quando inicializar o client
}
