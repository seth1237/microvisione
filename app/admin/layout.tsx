import './admin.css'

export const instant = false

export const metadata = {
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <main id="main" className="min-w-0 flex-1">{children}</main>
}
