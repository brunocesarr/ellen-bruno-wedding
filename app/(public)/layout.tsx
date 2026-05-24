import { PageTransition } from '@/components/ui/PageTransition'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PageTransition>{children}</PageTransition>
}
