# Vayla Backend

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)
![Go](https://img.shields.io/badge/Go-1.23-00add8)
![Framework](https://img.shields.io/badge/framework-Gin-008ecf)
![Database](https://img.shields.io/badge/database-PostgreSQL%2016-336791)
![Cache](https://img.shields.io/badge/cache-Redis%207-dc382d)
![Docs](https://img.shields.io/badge/docs-OpenAPI%203-6ba539)
API do Vayla responsável por catálogo, autenticação administrativa, pedidos, estoque, clientes, analytics e checkout via WhatsApp.

## Visão geral

Este módulo concentra a camada de negócio e persistência da plataforma. Ele atende tanto a vitrine pública quanto o painel administrativo, mantendo isolamento por loja através de `store_id`, `slug`, domínio e subdomínio.

Fluxos principais do backend:

1. Expor dados públicos da loja, categorias, produtos e configurações visíveis no storefront.
2. Autenticar administradores por loja com JWT.
3. Registrar pedidos vindos do checkout e gerar a mensagem final para o WhatsApp.
4. Disponibilizar operações de gestão para produtos, categorias, pedidos, clientes, estoque e configurações.

## Stack

- Go 1.23
- Gin
- PostgreSQL 16
- Redis 7
- Docker Compose
- AWS SDK v2 compatível com S3/Object Storage

## Estrutura

```text
backend/
|-- cmd/api/                 # bootstrap da aplicação
|-- internal/
|   |-- config/              # carregamento de configuração
|   |-- database/            # conexões com PostgreSQL e Redis
|   |-- http/                # servidor HTTP e handlers
|   |-- model/               # modelos e DTOs
|   |-- modules/             # registro das rotas públicas e admin
|   |-- repository/          # acesso a dados
|   `-- service/             # regras de negócio e integrações
|-- migrations/              # scripts SQL versionados
|-- schema.sql               # schema inicial
|-- seed.sql                 # seed inicial
|-- openapi.yaml             # contrato da API
|-- docker-compose.yml
|-- run-local.ps1
`-- .env.example
```

## Capacidades do módulo

- Healthcheck da aplicação.
- Resolução de loja por `slug`, `store_id` e domínio.
- Catálogo público com categorias e produtos.
- Configurações públicas de banner e WhatsApp.
- Checkout que registra pedido e gera URL de redirecionamento para WhatsApp.
- Login administrativo com JWT.
- CRUD administrativo de produtos e categorias.
- Gestão de pedidos, clientes e estoque.
- Dashboard e analytics da loja.
- Upload de imagens para object storage quando configurado.

## Como rodar localmente

### Pré-requisitos

- Go 1.23+
- Docker + Docker Compose

### 1. Configurar ambiente

```powershell
cd backend
Copy-Item .env.example .env
```

### 2. Subir infraestrutura

```powershell
docker compose up -d
```

Ou com `Makefile`:

```powershell
make up
```

Serviços expostos por padrão:

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/docs`
- OpenAPI: `http://localhost:8080/openapi.yaml`
- Adminer: `http://localhost:8081`
- PostgreSQL: `localhost:4567`
- Redis: `localhost:6379`

### 3. Rodar a API

```powershell
go run ./cmd/api
```

Ou:

```powershell
make run
```

No Windows, também é possível usar:

```powershell
.\run-local.ps1
```

## Variáveis de ambiente

Arquivo base: `.env.example`

### Aplicação

- `APP_ENV=local`
- `APP_PORT=8080`
- `APP_NAME=multi-tennet`
- `BASE_URL=http://localhost:8080`
- `JWT_SECRET=change-me`

### Banco de dados

- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_NAME=multi_tennet`
- `DB_SSLMODE=disable`

Observação: no `docker-compose.yml`, o PostgreSQL é publicado na porta `4567` do host por padrão, embora o processo dentro do container use `5432`.

### Redis

- `REDIS_HOST=localhost`
- `REDIS_PORT=6379`
- `REDIS_PASSWORD=redispass`

### Object storage

- `ORACLE_REGION`
- `ORACLE_NAMESPACE`
- `ORACLE_BUCKET_NAME`
- `ORACLE_ACCESS_KEY_ID`
- `ORACLE_SECRET_ACCESS_KEY`
- `ORACLE_S3_ENDPOINT`
- `ORACLE_PUBLIC_BASE_URL`
- `MAX_FILE_SIZE`

Se as variáveis de storage não forem configuradas corretamente, a API sobe, mas o upload fica desabilitado.

## Banco, migrations e seed

Na primeira criação do volume, o PostgreSQL inicializa com:

- `schema.sql`
- `seed.sql`

Scripts adicionais:

- `migrations/001_init.sql`
- `migrations/002_seed.sql`
- `migrations/003_categories_unique_name.sql`

Comandos úteis:

```powershell
make migrate
make seed
make psql
make logs
make down
```

## Dados iniciais

O seed local cria uma loja demo pronta para integração com o frontend:

- Loja: `Loja Modelo`
- Slug: `loja-modelo`
- Store ID: `1`
- Admin e-mail: `admin@lojamodelo.local`
- Admin senha: `admin123`

## Endpoints principais

### Infra

- `GET /health`
- `GET /docs`
- `GET /openapi.yaml`

### Públicos

- `GET /stores/{slug}`
- `GET /stores/id/{storeID}`
- `GET /stores/resolve-domain?host=...`
- `GET /stores/{slug}/categories`
- `GET /stores/id/{storeID}/categories`
- `GET /stores/{slug}/products`
- `GET /stores/id/{storeID}/products`
- `GET /stores/{slug}/products/{productSlug}`
- `GET /stores/id/{storeID}/products/{productSlug}`
- `GET /stores/{slug}/banner-settings`
- `GET /stores/id/{storeID}/banner-settings`
- `GET /stores/{slug}/whatsapp-settings`
- `GET /stores/id/{storeID}/whatsapp-settings`
- `POST /checkout/whatsapp`
- `POST /tracking/visit`

### Administrativos

- `POST /stores/id/{storeID}/admin/login`
- `GET /stores/id/{storeID}/admin/dashboard`
- `GET /stores/id/{storeID}/admin/analytics`
- CRUD de produtos em `/stores/id/{storeID}/admin/products`
- CRUD de categorias em `/stores/id/{storeID}/admin/categories`
- Gestão de pedidos em `/stores/id/{storeID}/admin/orders`
- Gestão de clientes em `/stores/id/{storeID}/admin/customers`
- Gestão de estoque em `/stores/id/{storeID}/admin/inventory`
- Configurações da loja em `/stores/id/{storeID}/admin/store`
- Configurações de banner em `/stores/id/{storeID}/admin/banner-settings`
- Configurações de WhatsApp em `/stores/id/{storeID}/admin/whatsapp-settings`
- Upload de imagem em `/stores/id/{storeID}/admin/upload/image`

## Exemplo de checkout

```json
{
  "store_id": 1,
  "customer_name": "Maria Silva",
  "customer_phone": "11999999999",
  "items": [
    {
      "product_id": 1,
      "variant_id": 2,
      "quantity": 2
    }
  ]
}
```

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "order_id": 1,
    "whatsapp_message": "Olá! Quero fazer este pedido: ...",
    "whatsapp_url": "https://wa.me/5511999999999?text=..."
  }
}
```

## Healthcheck

```powershell
curl http://localhost:8080/health
```

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## Observações

- O backend depende de PostgreSQL e Redis ativos mesmo em ambiente local.
- O Swagger UI é servido pela própria API em `/docs`.
- O upload de imagens depende da configuração de object storage.
- O projeto já possui contrato OpenAPI em `openapi.yaml`, mas a cobertura documental pode ser expandida.

