BEGIN;

INSERT INTO stores (id, name, slug, description, whatsapp_number, logo_url, banner_url, primary_color, domain, subdomain, is_active)
VALUES
(1, 'Loja Modelo', 'loja-modelo', 'Loja de roupas para demonstração', '5511999999999', NULL, NULL, '#111111', NULL, 'loja-modelo', TRUE);

INSERT INTO categories (id, store_id, name, slug, description, is_active, sort_order)
VALUES
(1, 1, 'Camisetas', 'camisetas', 'Camisetas básicas e estampadas', TRUE, 1),
(2, 1, 'Calças', 'calcas', 'Calças jeans e sociais', TRUE, 2);

INSERT INTO products (id, store_id, category_id, name, slug, description, short_description, sku, price, discount_price, brand, gender, is_featured, is_active)
VALUES
(1, 1, 1, 'Camiseta Basic Preta', 'camiseta-basic-preta', 'Camiseta básica preta em algodão', 'Camiseta básica preta', 'TSH-001', 79.90, 0, 'Basic', 'unisex', TRUE, TRUE),
(2, 1, 2, 'Calça Jeans Slim', 'calca-jeans-slim', 'Calça jeans slim azul', 'Calça jeans slim', 'JEANS-001', 129.90, 0, 'Urban', 'male', TRUE, TRUE),
(3, 1, 1, 'Camiseta Oversized Branca', 'camiseta-oversized-branca', 'Camiseta oversized branca', 'Camiseta oversized', 'TSH-002', 99.90, 0, 'Basic', 'unisex', FALSE, TRUE);

INSERT INTO product_variants (id, product_id, sku, color, size, stock_quantity, reserved_quantity, price_override, is_active)
VALUES
(1, 1, 'TSH-001-PRETO-P', 'Preto', 'P', 50, 0, 0, TRUE),
(2, 1, 'TSH-001-PRETO-M', 'Preto', 'M', 40, 0, 0, TRUE),
(3, 2, 'JEANS-001-AZUL-42', 'Azul', '42', 25, 0, 0, TRUE),
(4, 3, 'TSH-002-BRANCO-G', 'Branco', 'G', 30, 0, 0, TRUE);

INSERT INTO whatsapp_settings (id, store_id, whatsapp_number, default_message_template, cart_message_template, single_product_message_template, is_active)
VALUES
(1, 1, '5511999999999', 'Olá! Quero fazer este pedido:', 'Olá! Quero finalizar meu carrinho:', 'Olá! Quero comprar este item:', TRUE);

SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('product_variants_id_seq', (SELECT MAX(id) FROM product_variants));
SELECT setval('whatsapp_settings_id_seq', (SELECT MAX(id) FROM whatsapp_settings));

COMMIT;

