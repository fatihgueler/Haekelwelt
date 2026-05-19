'use client';

import * as React from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { applyDiscountCodeAction, removeDiscountCodeAction } from '@/actions/discount';

export function DiscountInput({ appliedCode }: { appliedCode: string | null }) {
  const [pending, startTransition] = React.useTransition();
  const [code, setCode] = React.useState('');

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    startTransition(async () => {
      const res = await applyDiscountCodeAction({ code });
      if (res.ok) {
        toast.success(`Code ${res.code} angewendet.`);
        setCode('');
      } else {
        toast.error(res.message);
      }
    });
  };

  const remove = () => {
    startTransition(async () => {
      const res = await removeDiscountCodeAction();
      if (res.ok) toast.success('Code entfernt.');
      else toast.error(res.message);
    });
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">
        <span>
          Code <span className="font-semibold">{appliedCode}</span> ist aktiv.
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={remove}
          disabled={pending}
          aria-label="Code entfernen"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form className="flex gap-2" onSubmit={apply}>
      <Input
        type="text"
        name="code"
        autoComplete="off"
        placeholder="Rabattcode"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="flex-1"
        aria-label="Rabattcode"
      />
      <Button type="submit" variant="outline" size="sm" disabled={pending || !code.trim()}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Einlösen'}
      </Button>
    </form>
  );
}
