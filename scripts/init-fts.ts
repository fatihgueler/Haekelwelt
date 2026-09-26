/**
 * Wendet die Postgres-FTS-SQL (prisma/sql/01-init-search.sql) auf die laufende
 * Datenbank an. Idempotent. Wird üblicherweise direkt nach `prisma migrate dev`
 * oder im CI-Setup ausgeführt.
 *
 *   npm run db:fts:init
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

async function main() {
  const sql = await readFile(resolve('prisma/sql/01-init-search.sql'), 'utf8');
  // Sequenziell ausführen: Postgres mag mehrere Statements in einem
  // $executeRawUnsafe nicht durchgehend. Wir splitten an "; " gefolgt von Newline.
  // Kommentarzeilen vorher entfernen – sonst beginnt jeder Block mit "--" und
  // würde vom Filter unten komplett verworfen (dann liefe kein Statement).
  const statements = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  const db = new PrismaClient();
  try {
    for (const stmt of statements) {
      // executeRawUnsafe akzeptiert DDL ohne Param-Substitution.
      await db.$executeRawUnsafe(stmt);
    }
    console.warn(`Applied ${statements.length} FTS statement(s).`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
