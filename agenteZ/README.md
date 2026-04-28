# Lia IA — Consultora Inteligente de Franquias

Agente de vendas humanizado para captura, qualificação e aquecimento de leads de franquia via WhatsApp.

## Páginas
- `/` → Apresentação da Lia IA (documentação completa)
- `/demo` → Demo ao vivo: Lia Claude vs Lia GPT-4o

## Estrutura do Projeto
```
agenteZ/
├── index.html        # Apresentação / Landing page
├── demo.html         # Demo ao vivo (ex-poc)
├── vercel.json       # Configuração de rotas Vercel
├── api/
│   └── chat.js       # Edge function — proxy Claude + OpenAI
└── README.md
```

## Deploy no Vercel
1. Acesse vercel.com e faça login com GitHub
2. Clique em "Add New Project"
3. Selecione o repositório **agenteZ**
4. Configure as variáveis de ambiente:
   - `ANTHROPIC_API_KEY` → sua chave da Anthropic
   - `OPENAI_API_KEY` → sua chave da OpenAI
5. Clique em Deploy

## Links
- **Repositório:** https://github.com/juzafalao/agenteZ.git
- **Produção:** https://agente-z.vercel.app
- **Demo:** https://agente-z.vercel.app/demo

## Como usar a Demo
- Abra `/demo` no navegador ou celular
- As chaves já estão configuradas via env vars — é só conversar
- Digite como se fosse um lead interessado em franquia
- Após 3 mensagens aparece o botão "Gerar resumo para consultor"

## O que a Lia sabe

### Investimento
| Componente | Faixa |
|---|---|
| Taxa de franquia | R$ 20k – R$ 25k |
| Montagem do espaço | R$ 35k – R$ 50k |
| Máquinas (financiável) | R$ 28k – R$ 32k |
| **Total estimado** | **R$ 83k – R$ 107k** |

### Ciclo de vendas
- Ciclo normal: 12 a 22 dias
- Lead pronto (quente): 3 a 4 dias
- Reativação de morno: 15 dias

### Argumento central
**"Um negócio que não precisa de funcionário"** — operação self-service, gestão remota pelo celular, aberto 24h.

## Zafalao Tech · 2026
