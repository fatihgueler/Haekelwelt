import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import type { Cart, CartItem, Product, ProductImage } from '@prisma/client';

const CART_COOKIE = 'hw_cart';
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 Tage
const CART_TTL_DAYS = 30;

export type CartItemWithProduct = CartItem & {
  product: Product & { images: ProductImage[]; category: { slug: string } };
};

export type CartWithItems = Cart & { items: CartItemWithProduct[] };

function newCartToken() {
  return randomBytes(24).toString('base64url');
}

function newExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + CART_TTL_DAYS);
  return d;
}

async function readCartCookie(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(CART_COOKIE)?.value;
}

async function writeCartCookie(token: string) {
  const c = await cookies();
  c.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

async function clearCartCookie() {
  const c = await cookies();
  c.delete(CART_COOKIE);
}

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
          category: { select: { slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

/**
 * Liest den aktiven Cart für den aktuellen Request. Legt KEINEN Cart an –
 * gibt null zurück, wenn weder Cookie noch User-Cart vorhanden ist.
 */
export async function getCart(): Promise<CartWithItems | null> {
  const session = await auth();
  if (session?.user?.id) {
    const userCart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });
    if (userCart) return userCart;

    // Falls User Cookie-Cart hat: zusammenführen
    const cookieToken = await readCartCookie();
    if (cookieToken) {
      const merged = await mergeGuestCartIntoUser(cookieToken, session.user.id);
      return merged;
    }
    return null;
  }

  const token = await readCartCookie();
  if (!token) return null;
  return db.cart.findUnique({ where: { token }, include: cartInclude });
}

/**
 * Liest oder legt einen Cart an (für Gäste mit neuem Token, für User mit userId).
 */
export async function getOrCreateCart(): Promise<CartWithItems> {
  const existing = await getCart();
  if (existing) return existing;

  const session = await auth();
  if (session?.user?.id) {
    const created = await db.cart.create({
      data: {
        userId: session.user.id,
        expiresAt: newExpiry(),
      },
      include: cartInclude,
    });
    return created;
  }

  const token = newCartToken();
  const created = await db.cart.create({
    data: { token, expiresAt: newExpiry() },
    include: cartInclude,
  });
  await writeCartCookie(token);
  return created;
}

export async function addToCart(productId: string, quantity = 1): Promise<CartWithItems> {
  if (quantity < 1) throw new Error('Menge muss mindestens 1 sein.');

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true, stock: true, title: true },
  });
  if (!product || !product.isActive) throw new Error('Produkt nicht verfügbar.');

  const cart = await getOrCreateCart();
  const existing = cart.items.find((i) => i.productId === productId);
  const wantedQty = (existing?.quantity ?? 0) + quantity;
  if (wantedQty > product.stock) {
    throw new Error(
      `„${product.title}" ist nur noch ${product.stock} mal verfügbar – Wunschmenge ${wantedQty} überschreitet das.`,
    );
  }

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity: { increment: quantity } },
  });

  await db.cart.update({
    where: { id: cart.id },
    data: { expiresAt: newExpiry() },
  });

  return (await db.cart.findUnique({ where: { id: cart.id }, include: cartInclude }))!;
}

export async function setCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<CartWithItems | null> {
  if (quantity < 0) throw new Error('Menge darf nicht negativ sein.');

  const item = await db.cartItem.findUnique({
    where: { id: itemId },
    include: { product: { select: { stock: true, title: true } } },
  });
  if (!item) throw new Error('Position nicht gefunden.');

  if (quantity === 0) {
    await db.cartItem.delete({ where: { id: itemId } });
  } else {
    if (quantity > item.product.stock) {
      throw new Error(`Nur ${item.product.stock} Stück von „${item.product.title}" verfügbar.`);
    }
    await db.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  return getCart();
}

export async function removeCartItem(itemId: string): Promise<CartWithItems | null> {
  await db.cartItem.delete({ where: { id: itemId } });
  return getCart();
}

export async function clearCart(cartId: string): Promise<void> {
  await db.cartItem.deleteMany({ where: { cartId } });
}

async function mergeGuestCartIntoUser(
  guestToken: string,
  userId: string,
): Promise<CartWithItems | null> {
  return db.$transaction(async (tx) => {
    const guest = await tx.cart.findUnique({
      where: { token: guestToken },
      include: { items: true },
    });
    if (!guest) {
      await clearCartCookie();
      return tx.cart.findUnique({ where: { userId }, include: cartInclude });
    }

    let userCart = await tx.cart.findUnique({ where: { userId }, include: { items: true } });
    if (!userCart) {
      userCart = await tx.cart.create({
        data: { userId, expiresAt: newExpiry() },
        include: { items: true },
      });
    }

    for (const guestItem of guest.items) {
      const product = await tx.product.findUnique({
        where: { id: guestItem.productId },
        select: { stock: true },
      });
      if (!product) continue;

      const existing = userCart.items.find((i) => i.productId === guestItem.productId);
      const targetQty = Math.min((existing?.quantity ?? 0) + guestItem.quantity, product.stock);
      if (targetQty === 0) continue;

      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: userCart.id, productId: guestItem.productId } },
        create: { cartId: userCart.id, productId: guestItem.productId, quantity: targetQty },
        update: { quantity: targetQty },
      });
    }

    await tx.cart.delete({ where: { id: guest.id } });
    await clearCartCookie();
    return tx.cart.findUnique({ where: { id: userCart.id }, include: cartInclude });
  });
}

export async function cartItemCount(): Promise<number> {
  const cart = await getCart();
  if (!cart) return 0;
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}
