import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReviewStars } from '@/components/storefront/review-stars';
import { ReviewForm } from '@/components/storefront/review-form';
import { auth } from '@/auth';
import { canUserReviewProduct, getProductReviews, getReviewSummary } from '@/lib/reviews';
import { formatDateDE } from '@/lib/utils';

export async function ReviewsSection({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const [summary, reviews, session] = await Promise.all([
    getReviewSummary(productId),
    getProductReviews(productId),
    auth(),
  ]);

  const eligibility = session?.user?.id
    ? await canUserReviewProduct(session.user.id, productId)
    : null;

  return (
    <section className="container py-12 lg:py-16" aria-labelledby="reviews-heading">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="reviews-heading" className="font-serif text-3xl tracking-tight">
            Bewertungen
          </h2>
          {summary.count > 0 ? (
            <div className="mt-2 flex items-center gap-3">
              <ReviewStars value={summary.average} size="md" />
              <span className="text-sm text-muted-foreground">
                {summary.average.toFixed(1)} von 5 · {summary.count}{' '}
                {summary.count === 1 ? 'Bewertung' : 'Bewertungen'}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Noch keine Bewertungen für dieses Produkt.
            </p>
          )}
        </div>
        {summary.count > 0 ? <Distribution summary={summary} /> : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {reviews.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Sei die Erste, die dieses Stück bewertet.
            </p>
          ) : (
            <ul className="space-y-6">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <ReviewStars value={r.rating} size="sm" />
                      {r.title ? (
                        <p className="mt-2 font-serif text-lg tracking-tight">{r.title}</p>
                      ) : null}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{r.user.name ?? 'Anonym'}</p>
                      <p>{formatDateDE(r.createdAt)}</p>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {r.body}
                  </p>
                  {r.images.length > 0 ? (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {r.images.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square overflow-hidden rounded-xl bg-muted"
                        >
                          <Image
                            src={img.url}
                            alt={img.alt ?? 'Foto zur Bewertung'}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {r.isVerified ? (
                    <Badge variant="default" className="mt-4 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Verifizierter Kauf
                    </Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {!session?.user ? (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm">
              <h3 className="font-serif text-xl tracking-tight">Möchtest du bewerten?</h3>
              <p className="text-muted-foreground">
                Bewertungen sind unseren Käufer:innen vorbehalten. Bitte{' '}
                <Link
                  href={`/login?next=/produkte/${productSlug}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  melde dich an
                </Link>
                .
              </p>
            </div>
          ) : eligibility?.allowed ? (
            <ReviewForm productId={productId} />
          ) : eligibility?.alreadyReviewed ? (
            <div className="space-y-2 rounded-2xl border border-border bg-secondary/40 p-6 text-sm">
              <h3 className="font-serif text-xl tracking-tight">Danke für deine Bewertung</h3>
              <p className="text-muted-foreground">Du hast dieses Produkt bereits bewertet.</p>
            </div>
          ) : (
            <div className="space-y-2 rounded-2xl border border-border bg-secondary/40 p-6 text-sm">
              <h3 className="font-serif text-xl tracking-tight">Bewerten geht nur nach Kauf</h3>
              <p className="text-muted-foreground">
                Sobald du dieses Produkt bestellt und erhalten hast, kannst du es hier bewerten.
              </p>
            </div>
          )}
        </aside>
      </div>

      <Separator className="mt-12" />
      <p className="mt-4 text-xs text-muted-foreground">
        Bewertungen sind echte Rückmeldungen unserer Kund:innen. Wir behalten uns vor, rechtswidrige
        oder offensichtlich gefälschte Beiträge zu entfernen.
      </p>
    </section>
  );
}

function Distribution({
  summary,
}: {
  summary: { count: number; distribution: Record<1 | 2 | 3 | 4 | 5, number> };
}) {
  const rows = [5, 4, 3, 2, 1] as const;
  return (
    <dl className="grid grid-cols-1 gap-1 text-xs sm:w-64">
      {rows.map((r) => {
        const count = summary.distribution[r];
        const percent = summary.count === 0 ? 0 : Math.round((count / summary.count) * 100);
        return (
          <div key={r} className="flex items-center gap-2">
            <dt className="w-8 text-muted-foreground">{r}★</dt>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 bg-primary"
                style={{ width: `${percent}%` }}
              />
            </div>
            <dd className="w-8 text-right tabular-nums text-muted-foreground">{count}</dd>
          </div>
        );
      })}
    </dl>
  );
}
