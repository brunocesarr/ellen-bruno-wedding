import { PageTransition } from '@/components/ui/PageTransition'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageTransition>{children}</PageTransition>
    </main>
  )
}
