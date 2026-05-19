export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container py-12 lg:py-16">
      <article className="prose prose-stone dark:prose-invert mx-auto max-w-3xl">
        <header className="not-prose mb-8">
          <p className="text-sm uppercase tracking-wide text-primary">Rechtliches</p>
          <h1 className="font-serif text-4xl tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Stand: {updated}</p>
        </header>
        <div className="space-y-5 text-base leading-relaxed text-foreground/90 [&>h2]:mt-10 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:tracking-tight [&>h3]:mt-6 [&>h3]:font-serif [&>h3]:text-xl [&>ul]:list-disc [&>ul]:pl-6">
          {children}
        </div>
      </article>
    </div>
  );
}

export function LegalReviewNote() {
  return (
    <aside className="my-8 rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-sm">
      <p className="font-medium text-destructive">Vorlage – anwaltliche Prüfung erforderlich</p>
      <p className="mt-2 text-foreground/80">
        Dieser Text ist ein Vorlagen-Stub und ersetzt keine Rechtsberatung. Vor der Live-Schaltung
        muss er von einer Anwältin oder einem Anwalt geprüft und an die konkreten Verhältnisse
        angepasst werden.
      </p>
    </aside>
  );
}
