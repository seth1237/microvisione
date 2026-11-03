export function PageIntro({
  title,
  lede,
}: {
  title: string;
  lede?: string;
}) {
  return (
    <header className="max-w-3xl">
      <h1 className="text-3xl text-ink sm:text-4xl">{title}</h1>
      {lede ? <p className="mt-3 text-base text-muted">{lede}</p> : null}
    </header>
  );
}
