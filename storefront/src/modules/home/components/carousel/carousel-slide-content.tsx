"use client"

import { Button, Heading, Text } from "@medusajs/ui"
import type { CarouselSlide } from "@lib/data/branding"

type CarouselSlideContentProps = {
    slide: CarouselSlide
}

const CarouselSlideContent = ({ slide }: CarouselSlideContentProps) => {
    if (!slide.title && !slide.description && !slide.link_url) {
        return null
    }

    return (
        <div className="h-full flex flex-col justify-end items-start p-6 sm:p-12 bg-black/10">
            {slide.title && (
                <Heading
                    level="h1"
                    className="sm:text-7xl text-4xl font-bold text-ui-fg-base max-w-lg font-heading"
                >
                    {slide.title}
                </Heading>
            )}
            {slide.description && (
                <Text className="sm:text-lg text-sm font-semibold max-w-2xl mt-2 sm:mt-4">
                    {slide.description}
                </Text>
            )}
            {slide.link_url && (
                <a href={slide.link_url} className="mt-4 sm:mt-6">
                    <Button size="large">
                        {slide.link_text || slide.link_url}
                    </Button>
                </a>
            )}
        </div>
    )
}

export default CarouselSlideContent

