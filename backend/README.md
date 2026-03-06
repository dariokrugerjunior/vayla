# Multi-Tennet Backend (Go)

Backend inicial para SaaS multi-tenant de lojas de roupas com catálogo e checkout via WhatsApp.

## Stack
- Go + Gin
- PostgreSQL
- Redis
- Docker Compose

## Como subir com Docker Compose
1. Copie o `.env.example` para `.env` e ajuste os valores.
2. Suba os serviços:

```bash
make up
```

O PostgreSQL inicializa automaticamente com `schema.sql` e `seed.sql` na primeira vez que o volume é criado.

## Como rodar migrations manualmente
Se precisar reaplicar manualmente:

```bash
make migrate
```

## Como rodar seed manualmente

```bash
make seed
```

## Como rodar a aplicação

```bash
make run
```

Ou via Docker (usando `docker-compose.override.yml`):

```bash
docker compose up -d
```

## Healthcheck

```bash
curl http://localhost:8080/health
```

Resposta esperada:

```json
{"success":true,"data":{"status":"ok"}}
```

## Endpoints iniciais
- `GET /health`
- `GET /stores/:slug`
- `GET /stores/:slug/categories`
- `GET /stores/:slug/products`
- `GET /stores/:slug/products/:productSlug`
- `POST /checkout/whatsapp`
- `GET /admin/products?store_id=1`
- `POST /admin/products`

## Payload do checkout

```json
{
  "store_slug": "loja-modelo",
  "items": [
    {"product_id": 1, "variant_id": 2, "quantity": 2},
    {"product_id": 2, "variant_id": 3, "quantity": 1}
  ]
}
```

## Exemplo de resposta do checkout

```json
{
  "success": true,
  "data": {
    "order_id": 1,
    "whatsapp_message": "Olá! Quero fazer este pedido:\n\n1. Camiseta Basic Preta\nTamanho: M\nCor: Preto\nQtd: 2\nValor: R$ 159.80\n\n2. Calça Jeans Slim\nTamanho: 42\nCor: Azul\nQtd: 1\nValor: R$ 129.90\n\nTotal do pedido: R$ 289.70",
    "whatsapp_url": "https://wa.me/5511999999999?text=..."
  }
}
```

