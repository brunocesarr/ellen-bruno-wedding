import Image from 'next/image'
import { cn } from '../../src/lib/utils'

interface MonogramImageProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'h-28 w-28',
  md: 'h-40 w-40',
  lg: 'h-56 w-56',
  xl: 'h-72 w-72',
}

export function MonogramImage({ size = 'lg', className }: MonogramImageProps) {
  return (
    <div className={cn('relative animate-float', sizeMap[size], className)}>
      <Image
        src="/images/monogram-eb.png"
        alt="E&B Monogram — Ellen & Bruno"
        loading="eager"
        fill
        className="object-contain drop-shadow-sm"
        sizes="(max-width: 768px) 224px, 288px"
        priority
      />
    </div>
  )
}
