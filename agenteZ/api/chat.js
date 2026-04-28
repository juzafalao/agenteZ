export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { provider, messages, system, max_tokens } = body;

    if (provider === 'anthropic') {
      const KEY = process.env.ANTHROPIC_API_KEY;
      if (!KEY) return new Response(JSON.stringify({ error: 'Chave Anthropic não configurada' }), {
        status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: max_tokens || 400, system: system || '', messages }),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (provider === 'openai') {
      const KEY = process.env.OPENAI_API_KEY;
      if (!KEY) return new Response(JSON.stringify({ error: 'Chave OpenAI não configurada' }), {
        status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
        body: JSON.stringify({ model: 'gpt-4o', max_tokens: max_tokens || 400, messages }),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ error: 'Provider inválido' }), {
      status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno', detail: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
