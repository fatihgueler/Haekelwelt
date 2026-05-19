'use client';

import * as React from 'react';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitReviewAction } from '@/actions/reviews';
import { cn } from '@/lib/utils';

export function ReviewForm({ productId }: { productId: string }) {
  const [pending, startTransition] = React.useTransition();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const submit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (rating < 1) {
      setFieldErrors({ rating: ['Bitte wähle eine Sternebewertung.'] });
      return;
    }
    startTransition(async () => {
      const res = await submitReviewAction({
        productId,
        rating,
        title: title || undefined,
        body,
      });
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        toast.error(res.message);
        return;
      }
      toast.success('Danke für deine Bewertung!');
      setRating(0);
      setTitle('');
      setBody('');
    });
  };

  const displayRating = hover ?? rating;
  const ratingError = fieldErrors.rating?.[0];

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
      noValidate
    >
      <div className="space-y-1">
        <h3 className="font-serif text-xl tracking-tight">Deine Bewertung</h3>
        <p className="text-sm text-muted-foreground">
          Erzähle anderen Kund:innen, wie dir das Produkt gefällt.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Sterne</legend>
        <div
          className="flex gap-1"
          onMouseLeave={() => setHover(null)}
          role="radiogroup"
          aria-label="Sternebewertung"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= displayRating;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} ${n === 1 ? 'Stern' : 'Sterne'}`}
                disabled={pending}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                className={cn(
                  'rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  filled ? 'text-primary' : 'text-muted-foreground/40 hover:text-primary',
                )}
              >
                <Star className={cn('h-7 w-7', filled && 'fill-current')} aria-hidden />
              </button>
            );
          })}
        </div>
        {ratingError ? <p className="text-xs text-destructive">{ratingError}</p> : null}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="review-title">Überschrift (optional)</Label>
        <Input
          id="review-title"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Was war dein erster Eindruck?"
        />
        {fieldErrors.title?.[0] ? (
          <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-body">Deine Beschreibung</Label>
        <textarea
          id="review-body"
          required
          rows={5}
          minLength={20}
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Wie fühlt sich das Stück an? Wie passt es in deinen Alltag? Wem hast du es geschenkt?"
        />
        {fieldErrors.body?.[0] ? (
          <p className="text-xs text-destructive">{fieldErrors.body[0]}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">{body.length}/2000 Zeichen. Mindestens 20.</p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Bewertung absenden
      </Button>
    </form>
  );
}
