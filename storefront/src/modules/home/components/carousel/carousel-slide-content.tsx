"use client"

import { Button, Heading, Text } from "@medusajs/ui"
import type { CarouselSlide } from "@lib/data/branding"

type CarouselSlideContentProps = {
    slide: CarouselSlide
    index: number
}

const CarouselSlideContent = ({ slide, index }: CarouselSlideContentProps) => {
    return (
        <>
            {slide.image_url ? (
                <img
                    src={slide.image_url}
                    alt={slide.title || `Slide ${index + 1}`}
                    className="embla__slide__img block h-full w-full object-cover select-none"
                />
            ) : (
                <div className="h-full w-full bg-ui-bg-subtle" />
            )}
            {(slide.title || slide.description || slide.link_url) && (
                <div className="absolute inset-0 z-10 flex flex-col justify-end items-start text-start small:p-12 gap-6 bg-black/10">
                    {slide.title && (
                        <Heading
                            level="h1"
                            className="text-7xl font-bold text-ui-fg-base max-w-lg"
                        >
                            {slide.title}
                        </Heading>
                    )}
                    {slide.description && (
                        <Text className="text-lg font-semibold max-w-2xl">
                            {slide.description}
                        </Text>
                    )}
                    {slide.link_url && (
                        <a href={slide.link_url}>
                            <Button size="large">
                                {slide.link_text || slide.link_url}
                            </Button>
                        </a>
                    )}
                </div>
            )}
        </>
    )
}

export default CarouselSlideContent

