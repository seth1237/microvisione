const OPEN = "[[mv-fields]]";
const CLOSE = "[[/mv-fields]]";

export type ProductExtras = {
  details: string;
  howToUse: string;
  measuringParameters: string;
};

/** The public catalogue API keeps overview text, and drops how-to-use and measuring parameters. */
export function readProductExtras(details: string): ProductExtras {
  const source = String(details || "");
  const start = source.lastIndexOf(OPEN);
  const end = source.lastIndexOf(CLOSE);
  if (start < 0 || end < start) {
    return { details: source.trim(), howToUse: "", measuringParameters: "" };
  }
  let howToUse = "";
  let measuringParameters = "";
  try {
    const parsed = JSON.parse(source.slice(start + OPEN.length, end).trim()) as {
      howToUse?: string;
      measuringParameters?: string;
    };
    howToUse = String(parsed.howToUse || "").trim();
    measuringParameters = String(parsed.measuringParameters || "").trim();
  } catch {
    return { details: source.trim(), howToUse: "", measuringParameters: "" };
  }
  return {
    details: source.slice(0, start).trim(),
    howToUse,
    measuringParameters,
  };
}

export function embedProductExtras(
  details: string,
  extra: { howToUse?: string; measuringParameters?: string },
) {
  const clean = readProductExtras(details).details;
  const howToUse = String(extra.howToUse || "").trim();
  const measuringParameters = String(extra.measuringParameters || "").trim();
  if (!howToUse && !measuringParameters) return clean;
  return `${clean}\n\n${OPEN}\n${JSON.stringify({ howToUse, measuringParameters })}\n${CLOSE}`;
}
