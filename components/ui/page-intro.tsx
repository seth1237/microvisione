export function PageIntro({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p> : null}
      <h1 className="mt-1 text-3xl text-ink sm:text-4xl">{title}</h1>
      {lede ? <p className="mt-3 text-base text-muted">{lede}</p> : null}
    </header>
  );
}
