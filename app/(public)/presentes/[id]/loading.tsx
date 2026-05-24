import { FloatingHeart } from '@/components/ui/FloatingHeart'

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream cream-grain">
      <FloatingHeart label="Carregando presentes…" />
    </main>
  )
}
