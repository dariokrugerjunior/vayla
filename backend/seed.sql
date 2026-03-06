BEGIN;

INSERT INTO stores (id, name, slug, description, whatsapp_number, logo_url, banner_url, primary_color, domain, subdomain, is_active)
VALUES
(1, 'Loja Modelo', 'loja-modelo', 'Loja de roupas para demonstração', '5511999999999', 'https://images.unsplash.com/photo-1662027044921-6febc57a0c53?q=80&w=1162&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://plus.unsplash.com/premium_photo-1664202525979-80d1da46b34b?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '#111111', NULL, 'loja-modelo', TRUE);

INSERT INTO users (id, store_id, name, email, password_hash, role, is_active)
VALUES
(1, 1, 'Admin Loja Modelo', 'admin@lojamodelo.local', '$2a$06$1TyABB7XVQ2UwMW63TTabeql3zQpqGgGYd/7fiD4s4z.g/XY8bO66', 'owner', TRUE);

INSERT INTO categories (id, store_id, name, slug, description, is_active, sort_order)
VALUES
(1, 1, 'Camisetas', 'camisetas', 'Camisetas básicas e estampadas', TRUE, 1),
(2, 1, 'Calças', 'calcas', 'Calças jeans e sarja', TRUE, 2),
(3, 1, 'Vestidos', 'vestidos', 'Vestidos casuais e festa', TRUE, 3),
(4, 1, 'Tênis', 'tenis', 'Tênis urbanos e esportivos', TRUE, 4),
(5, 1, 'Jaquetas', 'jaquetas', 'Jaquetas leves e corta-vento', TRUE, 5);

INSERT INTO products (id, store_id, category_id, name, slug, description, short_description, sku, price, discount_price, brand, gender, is_featured, is_active)
VALUES
(1, 1, 1, 'Camiseta Basic Preta', 'camiseta-basic-preta', 'Camiseta básica preta em algodão premium com caimento reto.', 'Camiseta básica preta', 'TSH-001', 79.90, 59.90, 'Basic', 'unisex', TRUE, TRUE),
(2, 1, 2, 'Calça Jeans Slim Azul', 'calca-jeans-slim-azul', 'Calça jeans slim com elastano e lavagem média.', 'Jeans slim azul', 'JNS-001', 149.90, 129.90, 'Urban', 'male', TRUE, TRUE),
(3, 1, 1, 'Camiseta Oversized Branca', 'camiseta-oversized-branca', 'Modelagem oversized em malha leve, ideal para uso diário.', 'Oversized branca', 'TSH-002', 99.90, 0, 'Street', 'unisex', FALSE, TRUE),
(4, 1, 3, 'Vestido Midi Floral', 'vestido-midi-floral', 'Vestido midi estampado com tecido fluido e cintura marcada.', 'Midi floral', 'VST-001', 189.90, 159.90, 'Luna', 'female', TRUE, TRUE),
(5, 1, 4, 'Tênis Casual Branco', 'tenis-casual-branco', 'Tênis casual branco com sola confortável para rotina urbana.', 'Tênis casual branco', 'TEN-001', 229.90, 199.90, 'Move', 'unisex', TRUE, TRUE),
(6, 1, 5, 'Jaqueta Corta-Vento Preta', 'jaqueta-corta-vento-preta', 'Jaqueta leve resistente ao vento com capuz ajustável.', 'Corta-vento preta', 'JQT-001', 249.90, 0, 'Nord', 'unisex', FALSE, TRUE),
(7, 1, 2, 'Calça Cargo Bege', 'calca-cargo-bege', 'Calça cargo com bolsos laterais e modelagem reta.', 'Cargo bege', 'CRG-001', 169.90, 139.90, 'Urban', 'unisex', FALSE, TRUE),
(8, 1, 3, 'Vestido Preto Tubinho', 'vestido-preto-tubinho', 'Vestido tubinho clássico com tecido encorpado e elegante.', 'Tubinho preto', 'VST-002', 179.90, 149.90, 'Luna', 'female', FALSE, TRUE),
(9, 1, 1, 'Camiseta Estampa Minimal', 'camiseta-estampa-minimal', 'Camiseta com estampa frontal minimalista e toque macio.', 'Estampa minimal', 'TSH-003', 89.90, 69.90, 'Basic', 'unisex', TRUE, TRUE),
(10, 1, 4, 'Tênis Runner Grafite', 'tenis-runner-grafite', 'Tênis estilo runner com cabedal respirável e amortecimento leve.', 'Runner grafite', 'TEN-002', 259.90, 219.90, 'Move', 'unisex', FALSE, TRUE);

INSERT INTO product_variants (id, product_id, sku, color, size, stock_quantity, reserved_quantity, price_override, is_active)
VALUES
(1, 1, 'TSH-001-PTO-P', 'Preto', 'P', 35, 0, 0, TRUE),
(2, 1, 'TSH-001-PTO-M', 'Preto', 'M', 42, 0, 0, TRUE),
(3, 1, 'TSH-001-PTO-G', 'Preto', 'G', 28, 0, 0, TRUE),
(4, 2, 'JNS-001-AZL-40', 'Azul', '40', 18, 0, 0, TRUE),
(5, 2, 'JNS-001-AZL-42', 'Azul', '42', 22, 0, 0, TRUE),
(6, 2, 'JNS-001-AZL-44', 'Azul', '44', 16, 0, 0, TRUE),
(7, 3, 'TSH-002-BR-P', 'Branco', 'P', 24, 0, 0, TRUE),
(8, 3, 'TSH-002-BR-M', 'Branco', 'M', 30, 0, 0, TRUE),
(9, 4, 'VST-001-FLR-P', 'Floral', 'P', 12, 0, 0, TRUE),
(10, 4, 'VST-001-FLR-M', 'Floral', 'M', 14, 0, 0, TRUE),
(11, 5, 'TEN-001-BR-37', 'Branco', '37', 10, 0, 0, TRUE),
(12, 5, 'TEN-001-BR-39', 'Branco', '39', 14, 0, 0, TRUE),
(13, 6, 'JQT-001-PTO-M', 'Preto', 'M', 8, 0, 0, TRUE),
(14, 6, 'JQT-001-PTO-G', 'Preto', 'G', 9, 0, 0, TRUE),
(15, 7, 'CRG-001-BGE-40', 'Bege', '40', 15, 0, 0, TRUE),
(16, 7, 'CRG-001-BGE-42', 'Bege', '42', 12, 0, 0, TRUE),
(17, 8, 'VST-002-PTO-P', 'Preto', 'P', 11, 0, 0, TRUE),
(18, 8, 'VST-002-PTO-M', 'Preto', 'M', 13, 0, 0, TRUE),
(19, 9, 'TSH-003-CZA-P', 'Cinza', 'P', 21, 0, 0, TRUE),
(20, 9, 'TSH-003-CZA-M', 'Cinza', 'M', 26, 0, 0, TRUE),
(21, 10, 'TEN-002-GRF-38', 'Grafite', '38', 9, 0, 0, TRUE),
(22, 10, 'TEN-002-GRF-40', 'Grafite', '40', 11, 0, 0, TRUE);

INSERT INTO public.product_images (product_id,image_url,sort_order,is_cover,created_at) VALUES
	 (1,'https://plus.unsplash.com/premium_photo-1723619071557-de044e3513a4?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096'),
	 (1,'https://images.unsplash.com/photo-1763750581767-b367bcd6c117?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',2,false,'2026-03-06 19:50:39.096'),
	 (2,'https://plus.unsplash.com/premium_photo-1671571135003-ea1677f46941?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096'),
	 (2,'https://plus.unsplash.com/premium_photo-1727943024952-1876cd7ffa07?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',2,false,'2026-03-06 19:50:39.096'),
	 (3,'https://images.unsplash.com/photo-1722310752951-4d459d28c678?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096'),
	 (4,'https://images.unsplash.com/photo-1690444963408-9573a17a8058?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096'),
	 (4,'https://images.unsplash.com/photo-1762154057377-cc9d3dd6900c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',2,false,'2026-03-06 19:50:39.096'),
	 (5,'https://images.unsplash.com/photo-1617032870223-739a0362a2ec?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096'),
	 (5,'https://images.unsplash.com/photo-1565021861162-e2a8c7e817e6?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',2,false,'2026-03-06 19:50:39.096'),
	 (6,'https://images.unsplash.com/photo-1588011025378-15f4778d2558?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096');
INSERT INTO public.product_images (product_id,image_url,sort_order,is_cover,created_at) VALUES
	 (7,'https://images.unsplash.com/photo-1517438587856-01447fbf58a4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096'),
	 (8,'https://plus.unsplash.com/premium_photo-1675253133852-e8f98ebc5695?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096'),
	 (9,'https://plus.unsplash.com/premium_photo-1690034979580-ec13112ec344?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096'),
	 (10,'https://plus.unsplash.com/premium_photo-1663127429325-3acefe582da5?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,true,'2026-03-06 19:50:39.096'),
	 (10,'https://images.unsplash.com/photo-1552346210-468fb42f5e5b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',2,false,'2026-03-06 19:50:39.096');


INSERT INTO whatsapp_settings (id, store_id, whatsapp_number, default_message_template, cart_message_template, single_product_message_template, is_active)
VALUES
(1, 1, '5511999999999', 'Olá! Quero fazer este pedido:', 'Olá! Quero finalizar meu carrinho:', 'Olá! Quero comprar este item:', TRUE);

INSERT INTO store_banners (id, store_id, title, subtitle, button_text, button_url, title_color, subtitle_color, button_bg_color, button_text_color, is_active)
VALUES
(1, 1, 'Coleção Outono/Inverno 2026', 'Descubra as últimas tendências em moda com até 30% de desconto', 'Ver Coleção', '/stores/id/1?category=camisetas', '#FFFFFF', '#F5F5F5', '#FFFFFF', '#111111', TRUE);

SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('product_variants_id_seq', (SELECT MAX(id) FROM product_variants));
SELECT setval('product_images_id_seq', (SELECT MAX(id) FROM product_images));
SELECT setval('whatsapp_settings_id_seq', (SELECT MAX(id) FROM whatsapp_settings));
SELECT setval('store_banners_id_seq', (SELECT MAX(id) FROM store_banners));

COMMIT;
