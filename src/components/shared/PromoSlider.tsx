"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const promotions = [
  {
    image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=1925&auto=format&fit=crop",
    title: "Promo Spesial!",
    description: "Cuci 5kg, Gratis Setrika. Pakaian Anda bersih dan rapi tanpa biaya tambahan.",
  },
  {
    image: "https://images.unsplash.com/photo-1608847135384-9b4de3a7f2a6?q=80&w=2070&auto=format&fit=crop",
    title: "Antar Jemput Gratis",
    description: "Layanan antar jemput gratis untuk area dalam kota. Hemat waktu dan tenaga Anda.",
  },
  {
    image: "https://images.unsplash.com/photo-1593113646773-973c74252f8a?q=80&w=2070&auto=format&fit=crop",
    title: "Diskon 20% Member Baru",
    description: "Daftar jadi member sekarang dan nikmati diskon 20% untuk cucian pertama Anda.",
  },
  {
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc016545e?q=80&w=2070&auto=format&fit=crop",
    title: "Garansi Bersih 100%",
    description: "Kami jamin pakaian Anda bersih sempurna atau kami cuci ulang gratis!",
  },
]

export function PromoSlider() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full rounded-lg overflow-hidden"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {promotions.map((promo, index) => (
          <CarouselItem key={index}>
            <Card className="border-none">
              <CardContent className="relative flex items-center justify-center p-0 aspect-video sm:aspect-[3/1] md:aspect-[4/1]">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white shadow-lg">{promo.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 mt-2 max-w-md shadow-lg">{promo.description}</p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
    </Carousel>
  )
}