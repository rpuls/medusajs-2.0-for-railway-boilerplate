"use client"

import { useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { CarouselSlide } from "@lib/data/branding"
import Fade from "embla-carousel-fade"
import Autoplay from "embla-carousel-autoplay"
import { useAutoplay, useAutoplayProgress, useCarouselIndex, usePrevNextButtons } from "@lib/hooks/use-carousel"
import CarouselSlideContent from "./carousel-slide-content"
import CarouselControls from "./carousel-controls"

type CarouselProps = {
    carouselSlides: CarouselSlide[]
}

const Carousel = ({ carouselSlides }: CarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, duration: 30 },
        [Fade(), Autoplay({ playOnInit: false, delay: 5000 })]
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

    const { currentSlide, totalSlides } = useCarouselIndex(emblaApi)

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

            <div className="absolute bottom-4 right-4">
                <CarouselControls ref={progressRef} currentIndex={currentSlide} totalSlides={totalSlides} onPrev={() => onAutoplayButtonClick(onPrevButtonClick)} onNext={() => onAutoplayButtonClick(onNextButtonClick)} isPrevDisabled={prevBtnDisabled} isNextDisabled={nextBtnDisabled} isPlaying={autoplayIsPlaying} showAutoplayProgress={showAutoplayProgress} toggleAutoplay={toggleAutoplay} />
            </div>
        </div>
    )
}

export default Carousel
