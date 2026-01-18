"use client"

import { useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { clx } from "@medusajs/ui"
import type { CarouselSlide } from "@lib/data/branding"
import Fade from "embla-carousel-fade"
import Autoplay from "embla-carousel-autoplay"
import { IconButton } from "@medusajs/ui"
// import { MediaPlay, Pause } from "@medusajs/icons"
import { MediaPlay, MediaStopSolid } from "@medusajs/icons"
import { PrevButton, NextButton, usePrevNextButtons } from "./carousel-arrow-buttons"
import { useAutoplay } from "./carousel-autoplay"
import { useAutoplayProgress } from "./carousel-autoplay-progress"
import CarouselSlideContent from "./carousel-slide-content"

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
                            <CarouselSlideContent slide={slide} index={index} />
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
