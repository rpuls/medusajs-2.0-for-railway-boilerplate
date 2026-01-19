"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { EmblaCarouselType } from 'embla-carousel'

// useCarouselIndex hook
type UseCarouselInfoType = {
    currentSlide: number
    totalSlides: number
}

export const useCarouselIndex = (
    emblaApi: EmblaCarouselType | undefined
): UseCarouselInfoType => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [totalSlides, setTotalSlides] = useState(0)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setCurrentSlide(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    const onInit = useCallback(() => {
        if (!emblaApi) return
        setTotalSlides(emblaApi.scrollSnapList().length)
        setCurrentSlide(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return

        onInit()
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onInit)

        return () => {
            emblaApi.off('select', onSelect)
            emblaApi.off('reInit', onInit)
        }
    }, [emblaApi, onSelect, onInit])

    return {
        currentSlide,
        totalSlides
    }
}

// usePrevNextButtons hook
type UsePrevNextButtonsType = {
    prevBtnDisabled: boolean
    nextBtnDisabled: boolean
    onPrevButtonClick: () => void
    onNextButtonClick: () => void
}

export const usePrevNextButtons = (
    emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

    const onPrevButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollPrev()
    }, [emblaApi])

    const onNextButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollNext()
    }, [emblaApi])

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setPrevBtnDisabled(!emblaApi.canScrollPrev())
        setNextBtnDisabled(!emblaApi.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        onSelect(emblaApi)
        emblaApi.on("reInit", onSelect).on("select", onSelect)
    }, [emblaApi, onSelect])

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    }
}

// useAutoplay hook
type UseAutoplayType = {
    autoplayIsPlaying: boolean
    toggleAutoplay: () => void
    onAutoplayButtonClick: (callback: () => void) => void
}

export const useAutoplay = (
    emblaApi: EmblaCarouselType | undefined
): UseAutoplayType => {
    const [autoplayIsPlaying, setAutoplayIsPlaying] = useState(false)

    const onAutoplayButtonClick = useCallback(
        (callback: () => void) => {
            const autoplay = emblaApi?.plugins()?.autoplay
            if (!autoplay) return

            const resetOrStop =
                autoplay.options.stopOnInteraction === false
                    ? autoplay.reset
                    : autoplay.stop

            resetOrStop()
            callback()
        },
        [emblaApi]
    )

    const toggleAutoplay = useCallback(() => {
        const autoplay = emblaApi?.plugins()?.autoplay
        if (!autoplay) return

        const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play
        playOrStop()
    }, [emblaApi])

    useEffect(() => {
        const autoplay = emblaApi?.plugins()?.autoplay
        if (!autoplay) return

        setAutoplayIsPlaying(autoplay.isPlaying())
        emblaApi
            .on("autoplay:play", () => setAutoplayIsPlaying(true))
            .on("autoplay:stop", () => setAutoplayIsPlaying(false))
            .on("reInit", () => setAutoplayIsPlaying(autoplay.isPlaying()))
    }, [emblaApi])

    return {
        autoplayIsPlaying,
        toggleAutoplay,
        onAutoplayButtonClick,
    }
}

// useAutoplayProgress hook
type UseAutoplayProgressType = {
    showAutoplayProgress: boolean
}

export const useAutoplayProgress = <ProgressElement extends HTMLElement>(
    emblaApi: EmblaCarouselType | undefined,
    progressNode: React.RefObject<ProgressElement>
): UseAutoplayProgressType => {
    const [showAutoplayProgress, setShowAutoplayProgress] = useState(false)
    const animationName = useRef('')
    const timeoutId = useRef(0)
    const rafId = useRef(0)


    const startProgress = useCallback((timeUntilNext: number | null) => {
        const node = progressNode.current

        if (!node) return
        if (timeUntilNext === null) return

        if (!animationName.current) {
            const style = window.getComputedStyle(node)
            animationName.current = style.animationName
        }

        // Record when the timer was set with high precision
        const timerStartTime = performance.now()

        node.style.animationName = 'none'
        node.style.clipPath = 'polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)'
        node.style.borderColor = 'rgba(0,0,0,0)'

        rafId.current = window.requestAnimationFrame(() => {
            timeoutId.current = window.setTimeout(() => {
                // Calculate elapsed time with high precision
                const elapsedTime = performance.now() - timerStartTime
                // Adjust duration to account for elapsed time
                const remainingTime = Math.max(0, timeUntilNext - elapsedTime)

                node.style.animationName = animationName.current
                node.style.animationDuration = `${remainingTime}ms`
            }, 0)
        })

        setShowAutoplayProgress(true)
    }, [progressNode])

    useEffect(() => {
        const autoplay = emblaApi?.plugins()?.autoplay
        if (!autoplay) return

        emblaApi
            .on('autoplay:timerset', () => startProgress(autoplay.timeUntilNext()))
            .on('autoplay:timerstopped', () => setShowAutoplayProgress(false))
    }, [emblaApi, startProgress])

    useEffect(() => {
        return () => {
            cancelAnimationFrame(rafId.current)
            clearTimeout(timeoutId.current)
        }
    }, [])

    return {
        showAutoplayProgress
    }
}

