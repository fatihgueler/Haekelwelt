import 'server-only';
import { Prisma, type Product, type ProductImage, type Category } from '@prisma/client';
import { db } from '@/lib/db';
import type { ProductSort } from '@/lib/products-shared';

export { PRODUCT_SORTS } from '@/lib/products-shared';
export type { ProductSort } from '@/lib/products-shared';

export type ProductListInput = {
  q?: string;
  categorySlugs?: string[];
  minCents?: number;
  maxCents?: number;
  inStockOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
};

export type ProductListItem = Product & {
  images: ProductImage[];
  category: Category;
};

export type ProductListResult = {
  items: ProductListItem[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

const DEFAULT_PER_PAGE = 24;
const MAX_PER_PAGE = 60;

/**
 * Einheitliche Listenabfrage für Storefront + Suche. Mit `q` wird Postgres FTS
 * verwendet (siehe prisma/sql/01-init-search.sql), ohne `q` greifen die übrigen
 * Filter direkt via Prisma-Query.
 */
export async function listProducts(input: ProductListInput): Promise<ProductListResult> {
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Math.floor(input.perPage ?? DEFAULT_PER_PAGE)),
  );
  const offset = (page - 1) * perPage;
  const sort = input.sort ?? 'newest';

  const q = (input.q ?? '').trim();
  if (q.length > 0) {
    return searchProducts({ ...input, q, page, perPage, offset, sort });
  }

  const where = buildWhere(input);
  const orderBy = buildOrderBy(sort);

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: true,
      },
      orderBy,
      skip: offset,
      take: perPage,
    }),
    db.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

function buildWhere(input: ProductListInput): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (input.categorySlugs && input.categorySlugs.length > 0) {
    where.category = { slug: { in: input.categorySlugs } };
  }
  if (typeof input.minCents === 'number') {
    where.priceCents = { ...(where.priceCents as object), gte: input.minCents };
  }
  if (typeof input.maxCents === 'number') {
    where.priceCents = { ...(where.priceCents as object), lte: input.maxCents };
  }
  if (input.inStockOnly) {
    where.stock = { gt: 0 };
  }
  return where;
}

function buildOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'price_asc':
      return { priceCents: 'asc' };
    case 'price_desc':
      return { priceCents: 'desc' };
    case 'title_asc':
      return { title: 'asc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

/**
 * FTS-Suche mit zusätzlichen Filtern. Wir bauen die WHERE-Klausel mit
 * Prisma.sql, damit User-Input parametrisiert wird (kein SQL-Injection).
 */
async function searchProducts(input: {
  q: string;
  categorySlugs?: string[];
  minCents?: number;
  maxCents?: number;
  inStockOnly?: boolean;
  sort: ProductSort;
  page: number;
  perPage: number;
  offset: number;
}): Promise<ProductListResult> {
  const fragments: Prisma.Sql[] = [Prisma.sql`p."isActive" = true`];
  fragments.push(Prisma.sql`p."searchVector" @@ websearch_to_tsquery('german', ${input.q})`);

  if (input.categorySlugs && input.categorySlugs.length > 0) {
    fragments.push(Prisma.sql`c.slug = ANY(${input.categorySlugs}::text[])`);
  }
  if (typeof input.minCents === 'number') {
    fragments.push(Prisma.sql`p."priceCents" >= ${input.minCents}`);
  }
  if (typeof input.maxCents === 'number') {
    fragments.push(Prisma.sql`p."priceCents" <= ${input.maxCents}`);
  }
  if (input.inStockOnly) {
    fragments.push(Prisma.sql`p.stock > 0`);
  }

  const whereSql = Prisma.join(fragments, ' AND ');

  let orderSql: Prisma.Sql;
  switch (input.sort) {
    case 'price_asc':
      orderSql = Prisma.sql`p."priceCents" ASC`;
      break;
    case 'price_desc':
      orderSql = Prisma.sql`p."priceCents" DESC`;
      break;
    case 'title_asc':
      orderSql = Prisma.sql`p.title ASC`;
      break;
    case 'newest':
      orderSql = Prisma.sql`p."createdAt" DESC`;
      break;
    default:
      // Standard für Suche: nach Relevanz
      orderSql = Prisma.sql`ts_rank(p."searchVector", websearch_to_tsquery('german', ${input.q})) DESC, p."createdAt" DESC`;
  }

  const idsRows = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT p.id
    FROM "Product" p
    JOIN "Category" c ON c.id = p."categoryId"
    WHERE ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ${input.perPage} OFFSET ${input.offset}
  `);

  const countRows = await db.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count
    FROM "Product" p
    JOIN "Category" c ON c.id = p."categoryId"
    WHERE ${whereSql}
  `);

  const total = Number(countRows[0]?.count ?? 0);

  const ids = idsRows.map((r) => r.id);
  if (ids.length === 0) {
    return {
      items: [],
      total,
      page: input.page,
      perPage: input.perPage,
      pageCount: Math.max(1, Math.ceil(total / input.perPage)),
    };
  }

  // Reihenfolge der IDs erhalten
  const itemsUnsorted = await db.product.findMany({
    where: { id: { in: ids } },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      category: true,
    },
  });
  const byId = new Map(itemsUnsorted.map((p) => [p.id, p]));
  const items = ids.map((id) => byId.get(id)).filter((p): p is ProductListItem => Boolean(p));

  return {
    items,
    total,
    page: input.page,
    perPage: input.perPage,
    pageCount: Math.max(1, Math.ceil(total / input.perPage)),
  };
}

export async function getPriceRangeCents(): Promise<{ min: number; max: number }> {
  const result = await db.product.aggregate({
    where: { isActive: true },
    _min: { priceCents: true },
    _max: { priceCents: true },
  });
  return {
    min: result._min.priceCents ?? 0,
    max: result._max.priceCents ?? 0,
  };
}
