import 'server-only';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function getWishlistProductIds(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user?.id) return new Set();
  const rows = await db.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return new Set(rows.map((r) => r.productId));
}

export async function getWishlist() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return db.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
