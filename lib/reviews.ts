import 'server-only';
import { db } from '@/lib/db';

export type ReviewSummary = {
  count: number;
  average: number; // 1.0 .. 5.0, gerundet auf 0.1
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  const rows = await db.review.groupBy({
    by: ['rating'],
    where: { productId },
    _count: { _all: true },
  });

  const distribution: ReviewSummary['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let weighted = 0;
  for (const r of rows) {
    if (r.rating >= 1 && r.rating <= 5) {
      const c = r._count._all;
      distribution[r.rating as 1 | 2 | 3 | 4 | 5] = c;
      total += c;
      weighted += r.rating * c;
    }
  }
  const average = total === 0 ? 0 : Math.round((weighted / total) * 10) / 10;
  return { count: total, average, distribution };
}

export async function getProductReviews(productId: string, limit = 20) {
  return db.review.findMany({
    where: { productId },
    include: {
      user: { select: { name: true } },
      images: true,
    },
    orderBy: [{ createdAt: 'desc' }],
    take: limit,
  });
}

export async function canUserReviewProduct(
  userId: string,
  productId: string,
): Promise<{ allowed: boolean; alreadyReviewed: boolean; verified: boolean }> {
  const [existing, paidOrder] = await Promise.all([
    db.review.findUnique({
      where: { productId_userId: { productId, userId } },
      select: { id: true },
    }),
    db.order.findFirst({
      where: {
        userId,
        status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] },
        items: { some: { productId } },
      },
      select: { id: true },
    }),
  ]);

  if (existing) return { allowed: false, alreadyReviewed: true, verified: Boolean(paidOrder) };
  if (!paidOrder) return { allowed: false, alreadyReviewed: false, verified: false };
  return { allowed: true, alreadyReviewed: false, verified: true };
}
