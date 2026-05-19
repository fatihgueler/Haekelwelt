-- Häkelwelt – Postgres Full-Text-Search setup (Phase 2)
--
-- Diesen Block einmal nach `prisma migrate dev` ausführen. Idempotent
-- (kann mehrfach ausgeführt werden, ohne Fehler zu werfen).
--
-- Anwendung im Prisma-Repo:
--   1. npm run db:migrate -- --name phase-2-features
--   2. psql $DATABASE_URL -f prisma/sql/01-init-search.sql
--
-- ODER: per Node-Skript via `npm run db:fts:init` (siehe package.json).

-- Generierte tsvector-Spalte aus Titel + Beschreibung. Gewichtungen:
--   A (Titel) - höher gewichtet
--   B (Beschreibung)
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('german', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('german', coalesce(description, '')), 'B')
  ) STORED;

-- GIN-Index für schnelle FTS-Anfragen.
CREATE INDEX IF NOT EXISTS "Product_searchVector_idx"
  ON "Product"
  USING GIN ("searchVector");
