# Vayla Frontend

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)
![React](https://img.shields.io/badge/React-18-61dafb)
![Router](https://img.shields.io/badge/router-React%20Router%207-ca4245)
![Build](https://img.shields.io/badge/build-Vite%206-646cff)
![UI](https://img.shields.io/badge/UI-Tailwind%20CSS%204-38bdf8)
![Admin](https://img.shields.io/badge/admin-JWT%20Auth-111111)
Aplicação React do Vayla responsável pela vitrine pública da loja e pelo painel administrativo.

## Visão geral

Este módulo consome a API do backend e entrega duas experiências principais:

1. Storefront público para navegação do catálogo, detalhes do produto, carrinho e checkout por WhatsApp.
2. Painel administrativo para gestão operacional da loja.

O roteamento suporta loja por `slug` e também redirecionamentos baseados em `store_id`, facilitando o uso em ambiente local e em cenários multi-tenant.

## Stack

- React 18
- React Router 7
- Vite 6
- Tailwind CSS 4
- Radix UI
- MUI
- Sonner

## Estrutura

```text
frontend/
|-- public/
|-- src/
|   |-- app/
|   |   |-- components/      # componentes compartilhados e UI
|   |   |-- contexts/        # estado global da loja e carrinho
|   |   |-- layouts/         # layouts do storefront e admin
|   |   |-- pages/
|   |   |   |-- storefront/  # home, produto, carrinho, checkout
|   |   |   `-- admin/       # dashboard, pedidos, clientes, estoque etc.
|   |   |-- services/        # integração com a API
|   |   |-- types/
|   |   `-- routes.ts        # definição das rotas
|   `-- styles/
|-- guidelines/
|-- index.html
`-- package.json
```

## Telas do módulo

### Storefront

- Home da loja
- Página de produto
- Carrinho
- Finalização do pedido no WhatsApp

### Admin

- Login
- Dashboard
- Produtos
- Categorias
- Pedidos
- Clientes
- Estoque
- Analytics
- Configurações da loja
- Configurações de WhatsApp

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm
- Backend do projeto rodando em `http://localhost:8080`

### 1. Criar o `.env`

```powershell
cd frontend
@"
VITE_API_URL=http://localhost:8080
VITE_STORE_ID=1
VITE_STORE_SLUG=loja-modelo
"@ | Set-Content .env
```

### 2. Instalar dependências

```powershell
npm install
```

### 3. Rodar em desenvolvimento

```powershell
npm run dev
```

Aplicação disponível em:

- `http://localhost:5173`

## Variáveis de ambiente

- `VITE_API_URL=http://localhost:8080`
- `VITE_STORE_ID=1`
- `VITE_STORE_SLUG=loja-modelo`

### O que cada variável controla

- `VITE_API_URL`: URL base da API.
- `VITE_STORE_ID`: loja padrão usada em rotas administrativas e chamadas por ID.
- `VITE_STORE_SLUG`: slug fallback usado quando a resolução por domínio não encontra uma loja.

## Rotas principais

### Públicas

- `/`
- `/:storeSlug`
- `/:storeSlug/product/:slug`
- `/:storeSlug/cart`
- `/:storeSlug/checkout`

### Administrativas

- `/admin`
- `/stores/id/:storeID/admin/login`
- `/stores/id/:storeID/admin`
- `/stores/id/:storeID/admin/products`
- `/stores/id/:storeID/admin/products/new`
- `/stores/id/:storeID/admin/products/:id/edit`
- `/stores/id/:storeID/admin/categories`
- `/stores/id/:storeID/admin/orders`
- `/stores/id/:storeID/admin/customers`
- `/stores/id/:storeID/admin/inventory`
- `/stores/id/:storeID/admin/analytics`
- `/stores/id/:storeID/admin/settings`
- `/stores/id/:storeID/admin/whatsapp`

## Fluxo local recomendado

Com o seed padrão do backend:

- Loja pública: `http://localhost:5173/loja-modelo`
- Admin login: `http://localhost:5173/stores/id/1/admin/login`
- Usuário: `admin@lojamodelo.local`
- Senha: `admin123`

## Integração com backend

O frontend consome os seguintes grupos de recurso:

- Loja e resolução por domínio
- Categorias e produtos
- Banner da loja
- Configurações públicas e administrativas de WhatsApp
- Checkout
- Tracking de visita
- Dashboard e analytics
- Produtos, categorias, pedidos, clientes e estoque do admin
- Upload de imagens

O token administrativo é armazenado no `localStorage` por loja.

## Scripts

```powershell
npm run dev
npm run build
```

## Observações

- Este módulo não funciona de forma útil sem o backend ativo.
- Para ambiente local com seed, mantenha `VITE_STORE_ID=1`.
- A rota `/` tenta resolver a loja pelo hostname e, em caso de falha, redireciona para o slug padrão.
- O painel administrativo depende de token JWT emitido pelo backend.

