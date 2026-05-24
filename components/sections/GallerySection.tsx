'use client'

import { PhotoGallery } from '../photo-gallery/PhotoGallery'

const PHOTOS = [
  {
    src: '/images/gallery/1.jpg',
    alt: 'Primeiro encontro',
    caption: 'o início',
  },
  { src: '/images/gallery/2.jpg', alt: 'Pedido de casamento', caption: 'sim!' },
  { src: '/images/gallery/3.jpg', alt: 'Ensaio fotográfico', caption: 'amor' },
  { src: '/images/gallery/4.jpg', alt: 'Viagem juntos', caption: 'aventura' },
  { src: '/images/gallery/5.jpg', alt: 'Família', caption: 'lar' },
  { src: '/images/gallery/6.jpg', alt: 'Sorrisos', caption: 'felizes' },
  { src: '/images/gallery/7.jpg', alt: 'Para sempre', caption: 'sempre' },
]

export function GallerySection() {
  return <PhotoGallery photos={PHOTOS} />
}
