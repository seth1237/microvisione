/**
 * Single source of truth for colour.
 * Change these values to re-theme the site. `tokenCss` is injected on :root
 * and Tailwind utilities read the variables (see app/globals.css).
 * TODO: replace with approved Microvision logo colours when they are supplied.
 */

export const palette = {
  brandBlue: "#1211bb",
  brandBlueDeep: "#0c0b78",
  brandBlueSoft: "#ecebfd",
  brandRed: "#d0121a",
  brandRedDeep: "#9b0e14",
  brandBlack: "#111111",
  ink: "#16161a",
  inkMuted: "#5c5c66",
  paper: "#f4f1ea",
  paperDeep: "#e6e1d6",
  surface: "#ffffff",
  line: "#e2ddd2",
  success: "#0d6b40",
  successSoft: "#e6f5ec",
  warning: "#8a5a00",
  warningSoft: "#fbf3d5",
  danger: "#b42318",
  dangerSoft: "#fdeceb",
  onAccent: "#ffffff",
  onBrand: "#ffffff",
  onDark: "#ffffff",
} as const;

export const tokenCss = `:root {
  --brand-blue: ${palette.brandBlue};
  --brand-blue-deep: ${palette.brandBlueDeep};
  --brand-blue-soft: ${palette.brandBlueSoft};
  --brand-red: ${palette.brandRed};
  --brand-red-deep: ${palette.brandRedDeep};
  --brand-black: ${palette.brandBlack};
  --ink: ${palette.ink};
  --ink-muted: ${palette.inkMuted};
  --paper: ${palette.paper};
  --paper-deep: ${palette.paperDeep};
  --surface: ${palette.surface};
  --line: ${palette.line};
  --success: ${palette.success};
  --success-soft: ${palette.successSoft};
  --warning: ${palette.warning};
  --warning-soft: ${palette.warningSoft};
  --danger: ${palette.danger};
  --danger-soft: ${palette.dangerSoft};
  --on-accent: ${palette.onAccent};
  --on-brand: ${palette.onBrand};
  --on-dark: ${palette.onDark};
  --focus-ring: ${palette.brandBlue};
  --elev-card: 0 12px 32px rgb(17 17 17 / 0.08);
  --elev-pop: 0 18px 50px rgb(17 17 17 / 0.16);
  --radius-md: 0.625rem;
}`;
