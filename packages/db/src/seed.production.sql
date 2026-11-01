-- Authoritative public catalogue seed for a fresh D1 deployment.
-- Prices are stored as whole rupiah: Rp 8.000 => 8000.
--
-- Alchemy imports this file on EVERY deploy (each push to main), so it must
-- seed the catalogue exactly once and never undo what the owner did in /admin:
--   * _seed_state records that the catalogue was seeded. Once the marker
--     exists, nothing below runs again, so a product or variant the owner
--     deleted (even all of them) never comes back.
--   * Each insert also requires its table to be empty. A database seeded
--     before the marker existed therefore gains no duplicates; the marker is
--     simply written at the end.
--   * Variants are inserted in ONE statement: product_variants has no unique
--     key, so INSERT OR IGNORE alone would add a fresh copy on each deploy.
--
-- Rows are listed in a WITH ... AS (VALUES ...) table. Do not chain SELECTs
-- together: Cloudflare D1 rejects that ("too many terms in compound SELECT").

CREATE TABLE IF NOT EXISTS _seed_state (key TEXT PRIMARY KEY NOT NULL);

INSERT OR IGNORE INTO product_categories (slug, name, description, display_order, is_active)
SELECT * FROM (VALUES
  ('mochi', 'Mochi', 'Mochi lembut dengan berbagai varian rasa', 1, 1),
  ('mango-sticky-rice', 'Mango Sticky Rice', 'Ketan manis dengan mangga segar', 2, 1),
  ('pancake-durian', 'Pancake Durian', 'Pancake lembut dengan isian durian', 3, 1),
  ('dubai-chewy-cookie', 'Dubai Chewy Cookie', 'Cookie chewy premium', 4, 1),
  ('slice-cake', 'Slice Cake', 'Kue lapis artisanal per slice', 5, 1),
  ('mille-crepes', 'Mille Crepes', 'Kue crepes berlapis-lapis per slice', 6, 1))
WHERE NOT EXISTS (SELECT 1 FROM _seed_state WHERE key = 'catalogue');

WITH seed (category_slug, slug, name, description, price_cents, display_order) AS (
  VALUES
    ('mochi', 'artisanal-mochi-daifuku', 'Artisanal Mochi Daifuku',
     'Mochi lembut buatan tangan dengan isian krim pilihan. Tersedia dalam 8 varian rasa dan tiga ukuran porsi — 1 pcs, isi 4, dan isi 8. Varian rasa boleh dicampur sesuai selera.',
     8000, 1),
    ('mango-sticky-rice', 'authentic-mango-sticky-rice', 'Authentic Mango Sticky Rice',
     'Ketan manis yang dikukus dengan santan, disajikan bersama potongan mangga segar. Harga datar per porsi.',
     30000, 2),
    ('pancake-durian', 'pancake-durian-premium', 'Pancake Durian Premium',
     'Pancake lembut dengan isian durian pilihan. Dijual harga datar tunggal Rp 35.000 per porsi mika, tanpa paket isi 4 atau isi 8. Wajib disimpan di chiller.',
     35000, 3),
    ('dubai-chewy-cookie', 'dubai-chewy-cookie', 'Dubai Chewy Cookie',
     'Cookie chewy premium dengan tekstur kenyal dan cokelat yang melimpah.',
     30000, 4),
    ('slice-cake', 'slice-cake', 'Slice Cake',
     'Kue lapis artisanal dengan tekstur lembut dan krim yang seimbang. Dijual per slice dengan tiga pilihan varian rasa — Lotus Biscoff, Red Velvet, dan Coklat. Ketiga varian seharga.',
     16000, 5),
    ('mille-crepes', 'mille-crepes', 'Mille Crepes',
     'Kue crepes berlapis-lapis dengan krim lembut. Dijual per slice dengan tiga pilihan varian rasa — Lotus Biscoff, Red Velvet, dan Coklat. Ketiga varian seharga.',
     16000, 6)
)
INSERT OR IGNORE INTO products
  (category_id, slug, name, description, price_cents, currency, is_featured, availability, display_order)
SELECT c.id, seed.slug, seed.name, seed.description, seed.price_cents, 'IDR', 1, 'available', seed.display_order
FROM seed
JOIN product_categories AS c ON c.slug = seed.category_slug
WHERE NOT EXISTS (SELECT 1 FROM products)
  AND NOT EXISTS (SELECT 1 FROM _seed_state WHERE key = 'catalogue');

WITH seed (slug, name, price_cents, display_order) AS (
  VALUES
    ('artisanal-mochi-daifuku', '1 Pcs', 8000, 1),
    ('artisanal-mochi-daifuku', 'Isi 4 pcs', 30000, 2),
    ('artisanal-mochi-daifuku', 'Isi 8 pcs', 50000, 3),
    ('slice-cake', 'Lotus Biscoff', 16000, 1),
    ('slice-cake', 'Red Velvet', 16000, 2),
    ('slice-cake', 'Coklat', 16000, 3),
    ('mille-crepes', 'Lotus Biscoff', 16000, 1),
    ('mille-crepes', 'Red Velvet', 16000, 2),
    ('mille-crepes', 'Coklat', 16000, 3)
)
INSERT INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT p.id, seed.name, seed.price_cents, 1, seed.display_order
FROM seed
JOIN products AS p ON p.slug = seed.slug
WHERE NOT EXISTS (SELECT 1 FROM product_variants)
  AND NOT EXISTS (SELECT 1 FROM _seed_state WHERE key = 'catalogue');

INSERT OR IGNORE INTO _seed_state (key) VALUES ('catalogue');

-- Varian rasa (sekali saja, ditandai 'flavors' di _seed_state):
--   * Mochi: 9 rasa; Mille Crepes dan Slice Cake: 3 rasa.
--   * Lotus Biscoff / Red Velvet / Coklat pada Mille Crepes dan Slice Cake
--     dulu disimpan sebagai varian ukuran; dipindah menjadi rasa.
-- Setelah penanda ada, rasa yang dihapus pemilik tidak muncul lagi.
WITH seed (slug, name, display_order) AS (
  VALUES
    ('artisanal-mochi-daifuku', 'Strawberry Choco', 1),
    ('artisanal-mochi-daifuku', 'Choco Crunchy', 2),
    ('artisanal-mochi-daifuku', 'Matcha Oreo', 3),
    ('artisanal-mochi-daifuku', 'Vanilla', 4),
    ('artisanal-mochi-daifuku', 'Red Velvet', 5),
    ('artisanal-mochi-daifuku', 'Mango Cheesecream', 6),
    ('artisanal-mochi-daifuku', 'Grape Choco', 7),
    ('artisanal-mochi-daifuku', 'Oreo Cheesecream', 8),
    ('artisanal-mochi-daifuku', 'Lotus Biscoff', 9),
    ('slice-cake', 'Lotus Biscoff', 1),
    ('slice-cake', 'Red Velvet', 2),
    ('slice-cake', 'Coklat', 3),
    ('mille-crepes', 'Lotus Biscoff', 1),
    ('mille-crepes', 'Red Velvet', 2),
    ('mille-crepes', 'Coklat', 3)
)
INSERT INTO product_flavors (product_id, name, is_available, display_order)
SELECT p.id, seed.name, 1, seed.display_order
FROM seed
JOIN products AS p ON p.slug = seed.slug
WHERE NOT EXISTS (SELECT 1 FROM product_flavors AS f WHERE f.product_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM _seed_state WHERE key = 'flavors');

DELETE FROM product_variants
WHERE name IN ('Lotus Biscoff', 'Red Velvet', 'Coklat')
  AND product_id IN (SELECT id FROM products WHERE slug IN ('slice-cake', 'mille-crepes'))
  AND NOT EXISTS (SELECT 1 FROM _seed_state WHERE key = 'flavors');

UPDATE products
SET description = REPLACE(description, '8 varian rasa', '9 varian rasa')
WHERE slug = 'artisanal-mochi-daifuku'
  AND description LIKE '%8 varian rasa%'
  AND NOT EXISTS (SELECT 1 FROM _seed_state WHERE key = 'flavors');

INSERT OR IGNORE INTO _seed_state (key) VALUES ('flavors');
