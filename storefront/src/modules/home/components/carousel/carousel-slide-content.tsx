"use client"

import { Heading, Text } from "@medusajs/ui"
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
                <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
                    {slide.title && (
                        <Heading
                            level="h1"
                            className="text-3xl leading-10 text-ui-fg-base font-normal"
                        >
                            {slide.title}
                        </Heading>
                    )}
                    {slide.description && (
                        <Text className="text-ui-fg-subtle text-lg max-w-2xl">
                            {slide.description}
                        </Text>
                    )}
                    {slide.link_url && (
                        <a href={slide.link_url}>
                            <Text className="text-ui-fg-interactive underline hover:text-ui-fg-interactive-hover">
                                {slide.link_text || slide.link_url}
                            </Text>
                        </a>
                    )}
                </div>
            )}
        </>
    )
}

export default CarouselSlideContent

