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
    <div className="pb-16">
      <header className="bg-granny border-b border-border/60 bg-secondary">
        <div className="container max-w-3xl py-10 lg:py-14">
          <p className="eyebrow">Rechtliches</p>
          <h1 className="mt-2">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Stand: {updated}</p>
        </div>
      </header>
      <article className="container max-w-3xl pt-8">
        <div className="legal-content text-pretty">{children}</div>
      </article>
    </div>
  );
}

export function LegalReviewNote() {
  return (
    <aside
      role="note"
      className="my-8 rounded-2xl border-2 border-dashed border-destructive/50 bg-destructive/5 p-5 text-sm"
    >
      <p className="font-medium text-destructive">Vorlage – anwaltliche Prüfung erforderlich</p>
      <p className="mt-2 text-foreground/80">
        Dieser Text ist ein Vorlagen-Stub und ersetzt keine Rechtsberatung. Vor der Live-Schaltung
        muss er von einer Anwältin oder einem Anwalt geprüft und an die konkreten Verhältnisse
        angepasst werden.
      </p>
    </aside>
  );
}
