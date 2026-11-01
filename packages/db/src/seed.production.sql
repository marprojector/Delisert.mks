-- Authoritative public catalogue seed for a fresh D1 deployment.
-- Prices are stored as whole rupiah: Rp 8.000 => 8000.
--
-- Alchemy imports this file on every deploy, so it must only fill an EMPTY
-- catalogue and never touch what the owner has changed in /admin:
--   * categories use INSERT OR IGNORE on their unique slug;
--   * products are inserted only while the products table is empty, so a
--     product the owner deleted does not come back on the next deploy;
--   * variants are inserted in ONE statement, only while product_variants is
--     empty. The table has no unique key, so INSERT OR IGNORE alone would add
--     a fresh copy of every variant on each deploy.
--
-- Rows are listed in a WITH ... AS (VALUES ...) table. Do not chain SELECTs
-- together: Cloudflare D1 rejects that ("too many terms in compound SELECT").

INSERT OR IGNORE INTO product_categories (slug, name, description, display_order, is_active)
VALUES
  ('mochi', 'Mochi', 'Mochi lembut dengan berbagai varian rasa', 1, 1),
  ('mango-sticky-rice', 'Mango Sticky Rice', 'Ketan manis dengan mangga segar', 2, 1),
  ('pancake-durian', 'Pancake Durian', 'Pancake lembut dengan isian durian', 3, 1),
  ('dubai-chewy-cookie', 'Dubai Chewy Cookie', 'Cookie chewy premium', 4, 1),
  ('slice-cake', 'Slice Cake', 'Kue lapis artisanal per slice', 5, 1),
  ('mille-crepes', 'Mille Crepes', 'Kue crepes berlapis-lapis per slice', 6, 1);

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
WHERE NOT EXISTS (SELECT 1 FROM products);

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
WHERE NOT EXISTS (SELECT 1 FROM product_variants);
