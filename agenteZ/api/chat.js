export const config = { runtime: 'edge' };

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://agente-z.vercel.app';

// Teto de max_tokens: maior valor enviado pelo demo.html (resumo = 700)
const MAX_TOKENS_CAP = 700;
const DEFAULT_MAX_TOKENS = 400;
const MAX_MESSAGES = 50;
const MAX_TOTAL_CHARS = 20000;

// Ecoa a origem só se for a permitida ou o próprio host (same-origin, inclusive previews)
function corsOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return ALLOWED_ORIGIN;
  if (origin === ALLOWED_ORIGIN) return origin;
  try {
    if (new URL(origin).host === req.headers.get('host')) return origin;
  } catch (_) {}
  return ALLOWED_ORIGIN;
}

function json(req, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': corsOrigin(req),
      'Vary': 'Origin',
    },
  });
}

function fail(req, status, message, type = 'proxy_error') {
  return json(req, { error: { type, message }, status }, status);
}

function contentLength(content) {
  if (typeof content === 'string') return content.length;
  return JSON.stringify(content ?? '').length;
}

// Repassa o erro real do provider (status + error.message), nunca a chave
async function providerError(req, res, providerName) {
  let data = null;
  try { data = await res.json(); } catch (_) {}
  const message =
    data?.error?.message ||
    (typeof data?.error === 'string' ? data.error : null) ||
    `${providerName} retornou HTTP ${res.status}`;
  const type = data?.error?.type || 'provider_error';
  return fail(req, res.status, message, type);
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin(req),
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      },
    });
  }

  if (req.method !== 'POST') {
    return fail(req, 405, 'Método não permitido');
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (_) {
      return fail(req, 400, 'Corpo da requisição não é um JSON válido');
    }
    const { provider, messages, system } = body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return fail(req, 400, 'O campo "messages" deve ser um array não vazio');
    }
    if (messages.length > MAX_MESSAGES) {
      return fail(req, 400, `Conversa muito longa: máximo de ${MAX_MESSAGES} mensagens por requisição`);
    }
    const totalChars =
      messages.reduce((sum, m) => sum + contentLength(m?.content), 0) +
      (typeof system === 'string' ? system.length : 0);
    if (totalChars > MAX_TOTAL_CHARS) {
      return fail(req, 400, `Conteúdo muito longo: máximo de ${MAX_TOTAL_CHARS} caracteres por requisição`);
    }

    const requested = Number(body.max_tokens);
    const max_tokens = Number.isFinite(requested) && requested > 0
      ? Math.min(Math.floor(requested), MAX_TOKENS_CAP)
      : DEFAULT_MAX_TOKENS;

    if (provider === 'anthropic') {
      const KEY = process.env.ANTHROPIC_API_KEY;
      if (!KEY) return fail(req, 500, 'Chave Anthropic não configurada');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens, system: system || '', messages }),
      });
      if (!res.ok) return providerError(req, res, 'Anthropic');
      const data = await res.json();
      if (!data.model) data.model = ANTHROPIC_MODEL;
      return json(req, data, res.status);
    }

    if (provider === 'openai') {
      const KEY = process.env.OPENAI_API_KEY;
      if (!KEY) return fail(req, 500, 'Chave OpenAI não configurada');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
        body: JSON.stringify({ model: 'gpt-4o', max_tokens, messages }),
      });
      if (!res.ok) return providerError(req, res, 'OpenAI');
      const data = await res.json();
      return json(req, data, res.status);
    }

    return fail(req, 400, 'Provider inválido');

  } catch (err) {
    return fail(req, 500, 'Erro interno: ' + err.message, 'internal_error');
  }
}
