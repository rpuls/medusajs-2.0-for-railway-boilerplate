"use client"

import { useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { clx, Heading, Text } from "@medusajs/ui"
import type { CarouselSlide } from "@lib/data/branding"
import Fade from "embla-carousel-fade"
import Autoplay from "embla-carousel-autoplay"
import { IconButton } from "@medusajs/ui"
// import { MediaPlay, Pause } from "@medusajs/icons"
import { MediaPlay, MediaStopSolid } from "@medusajs/icons"
import { PrevButton, NextButton, usePrevNextButtons } from "./carousel-arrow-buttons"
import { useAutoplay } from "./carousel-autoplay"
import { useAutoplayProgress } from "./carousel-autoplay-progress"

type CarouselProps = {
    carouselSlides: CarouselSlide[]
}

const Carousel = ({ carouselSlides }: CarouselProps) => {

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, duration: 30 },
        [Fade(), Autoplay({ playOnInit: false, delay: 3000 })]
    )

    const progressRef = useRef<HTMLDivElement>(null)
    const { showAutoplayProgress } = useAutoplayProgress(emblaApi, progressRef)

    const { autoplayIsPlaying, toggleAutoplay, onAutoplayButtonClick } = useAutoplay(emblaApi)

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    } = usePrevNextButtons(emblaApi)

    if (!carouselSlides || carouselSlides.length === 0) {
        return null
    }

    const sortedSlides = [...carouselSlides].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
    )

    return (
        <div className="embla border-b border-ui-border-base bg-ui-bg-base relative" style={{ '--slide-height': '75vh' } as React.CSSProperties}>
            <div className="embla__viewport overflow-hidden" ref={emblaRef}>
                <div className="embla__container flex touch-pan-y touch-pinch-zoom">
                    {sortedSlides.map((slide, index) => (
                        <div key={index} className="embla__slide translate-x-0 flex-[0_0_100%] min-w-0 relative h-[75vh]">
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
                                <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6 bg-black/10">
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
                        </div>
                    ))}
                </div>
            </div>

            <div className={clx("embla__progress absolute bottom-0 left-0 right-0 h-1 bg-ui-bg-subtle z-30 overflow-hidden shadow-inner transition-opacity duration-300", showAutoplayProgress ? "opacity-100" : "opacity-0")}>
                <div
                    ref={progressRef}
                    style={{
                        animationName: "autoplay-progress",
                        animationTimingFunction: "linear",
                        animationIterationCount: 1,
                        ...(showAutoplayProgress ? {} : { animationPlayState: "paused" }),
                    }}
                    className={clx("embla__progress__bar absolute w-full top-0 bottom-0 bg-ui-fg-interactive -left-full")}
                />
            </div>

            <div className="absolute inset-0 z-20 flex items-center justify-between px-4 pointer-events-none">
                <div className="pointer-events-auto">
                    <PrevButton
                        onClick={() => onAutoplayButtonClick(onPrevButtonClick)}
                        disabled={prevBtnDisabled}
                    />
                </div>
                <div className="pointer-events-auto">
                    <NextButton
                        onClick={() => onAutoplayButtonClick(onNextButtonClick)}
                        disabled={nextBtnDisabled}
                    />
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
                <IconButton
                    type="button"
                    onClick={toggleAutoplay}
                    variant="transparent"
                    className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30"
                >
                    {autoplayIsPlaying ? <MediaStopSolid /> : <MediaPlay />}
                </IconButton>
            </div>
        </div>
    )
}

export default Carousel
