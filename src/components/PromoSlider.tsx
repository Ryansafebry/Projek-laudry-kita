import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const promoImages = [
  { src: "https://images.unsplash.com/photo-1582751691229-81c043f03619?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Promo Spesial! Cuci 5kg Gratis Setrika" },
  { src: "https://images.unsplash.com/photo-1601122353573-c435a4a907a8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Deterjen Premium Tersedia" },
  { src: "https://images.unsplash.com/photo-1593113646773-5b86178a1a2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Antar Jemput Gratis Area Kota" },
  { src: "https://images.unsplash.com/photo-1545174542-d6a3a321f34b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Buka 24 Jam Setiap Hari" },
  { src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Member Baru Diskon 20%" },
];

export function PromoSlider() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full rounded-lg overflow-hidden shadow-lg"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {promoImages.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative">
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full aspect-[3/1] md:aspect-[4/1] object-cover" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4 md:p-8">
                <h2 className="text-white text-lg md:text-3xl font-bold">{image.alt}</h2>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
    </Carousel>
  )
}