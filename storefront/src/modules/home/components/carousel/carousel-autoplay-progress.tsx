"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { EmblaCarouselType } from 'embla-carousel'

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
        node.style.transform = 'translate3d(0,0,0)'

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
    }, [])

    useEffect(() => {
        const autoplay = emblaApi?.plugins()?.autoplay
        if (!autoplay) return

        emblaApi
            .on('autoplay:timerset', () => startProgress(autoplay.timeUntilNext()))
            .on('autoplay:timerstopped', () => setShowAutoplayProgress(false))
    }, [emblaApi])

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
