const CATEGORY_ALIAS: Record<string, string> = {
  "hemoglobin-meter": "hemoglobin-meters",
  "blood-glucose-meter": "blood-glucose-meters",
  "blood-gas-analyzer": "blood-gas-analyzers",
  "coagulation-analyzers": "coagulation-hemostasis",
  "hemostasis-analyzers": "coagulation-hemostasis",
}

const KNOWN_CATEGORIES = [
  "chemistry-analyzers",
  "electrolyte-analyzers",
  "hematology-analyzers",
  "immunofluorescence-analyzers",
  "hemoglobin-meters",
  "microscopes",
  "urine-analyzers",
  "coagulation-hemostasis",
  "chemiluminescence-analyzers",
  "centrifuges",
  "blood-glucose-meters",
  "blood-gas-analyzers",
  "ultrasound-machines",
]

export function legacyRedirectSources() {
  const rules: { source: string; destination: string; statusCode: 301 }[] = [
    { source: "/home-2", destination: "/", statusCode: 301 },
    { source: "/home-2/:path*", destination: "/", statusCode: 301 },
    { source: "/shop", destination: "/", statusCode: 301 },
    { source: "/shop/:path*", destination: "/", statusCode: 301 },
    { source: "/enquiry-cart", destination: "/quote", statusCode: 301 },
    { source: "/enquiry-cart/:path*", destination: "/quote", statusCode: 301 },
    { source: "/product-tag/:path*", destination: "/", statusCode: 301 },
  ]
  for (const [from, to] of Object.entries(CATEGORY_ALIAS)) {
    rules.push({ source: `/product-category/${from}`, destination: `/category/${to}`, statusCode: 301 })
    rules.push({ source: `/product-category/${from}/:path*`, destination: `/category/${to}`, statusCode: 301 })
  }
  for (const slug of KNOWN_CATEGORIES) {
    rules.push({ source: `/product-category/${slug}`, destination: `/category/${slug}`, statusCode: 301 })
    rules.push({ source: `/product-category/${slug}/:path*`, destination: `/category/${slug}`, statusCode: 301 })
  }
  rules.push({ source: "/product-category/:path*", destination: "/", statusCode: 301 })
  return rules
}

export function legacyRedirect(pathname: string): { to: string; status: number } | null {
  if (pathname === "/home-2" || pathname.startsWith("/home-2/")) return { to: "/", status: 301 }
  if (pathname === "/shop" || pathname.startsWith("/shop/")) return { to: "/", status: 301 }
  if (pathname === "/enquiry-cart" || pathname.startsWith("/enquiry-cart/")) return { to: "/quote", status: 301 }
  if (pathname === "/product-tag" || pathname.startsWith("/product-tag/")) return { to: "/", status: 301 }
  const prefix = "/product-category/"
  if (pathname !== "/product-category" && !pathname.startsWith(prefix)) return null
  const root = pathname.slice(prefix.length).split("/").filter(Boolean)[0] || ""
  if (!root) return { to: "/", status: 301 }
  if (CATEGORY_ALIAS[root]) return { to: `/category/${CATEGORY_ALIAS[root]}`, status: 301 }
  if (KNOWN_CATEGORIES.includes(root)) return { to: `/category/${root}`, status: 301 }
  return { to: "/", status: 301 }
}
