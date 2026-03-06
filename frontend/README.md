# Frontend - Vayla

Frontend do SaaS multi-tenant de lojas de roupas. Projeto em React + Vite.

## Requisitos
- Node.js 18+ (recomendado)
- npm

## Configuração
Crie um `.env` com as variáveis:

```bash
VITE_API_URL=http://localhost:8080
VITE_STORE_SLUG=loja-modelo
```

## Como rodar

```bash
npm install
npm run dev
```

Acesse:
- http://localhost:5173

## Estrutura
- `src/app/pages/storefront`: telas do catálogo
- `src/app/pages/admin`: telas administrativas
- `src/app/components`: componentes compartilhados

## Observações
- Este frontend consome a API do backend (Go).
- Para usar com os seeds, mantenha `VITE_STORE_SLUG=loja-modelo`.

