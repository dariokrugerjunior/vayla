BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_store_name_unique
	ON categories(store_id, lower(btrim(name)));

COMMIT;
