import { clx, IconButton } from '@medusajs/ui'
import { ChevronLeft, ChevronRight, PauseSolid, PlaySolid } from '@medusajs/icons'
import React, { forwardRef } from 'react'



type CarouselControlsProps = {
    currentIndex: number
    totalSlides: number
    onPrev: () => void
    onNext: () => void
    isPrevDisabled: boolean
    isNextDisabled: boolean
    isPlaying: boolean
    showAutoplayProgress: boolean
    toggleAutoplay: () => void
}


const CarouselControls = forwardRef<HTMLDivElement, CarouselControlsProps>(({ currentIndex, totalSlides, onPrev, onNext, isPrevDisabled, isNextDisabled, isPlaying, showAutoplayProgress, toggleAutoplay }, progressRef) => {
    return (
        <div className="flex gap-2 sm:gap-4 h-9">
            {/* Previous and Next Buttons */}
            <div className="rounded-full flex divide-x bg-ui-bg-base h-full overflow-hidden shadow border border-ui-border-base">
                <IconButton type='button' variant='transparent' size='base' className='rounded-none h-full w-9' onClick={onPrev} disabled={isPrevDisabled}>
                    <ChevronLeft className='text-ui-fg-muted' />
                </IconButton>
                <span className="w-10 flex items-center justify-center text-small-semi text-ui-fg-muted">{currentIndex + 1}/{totalSlides}</span>
                <IconButton type='button' variant='transparent' size='base' className='rounded-none h-full w-9' onClick={onNext} disabled={isNextDisabled}>
                    <ChevronRight className='text-ui-fg-muted' />
                </IconButton>
            </div>

            {/* Autoplay Button */}
            <IconButton
                type='button'
                size='base'
                className='rounded-full h-9 w-9 relative shadow'
                onClick={toggleAutoplay}
            >
                <div style={{
                    animationName: "time-loader",
                    animationTimingFunction: "linear",
                    animationIterationCount: 1,
                    ...(showAutoplayProgress ? {} : { animationPlayState: "paused" }),
                }} className={clx("absolute inset-0.5 rounded-full border-[16px] border-ui-fg-interactive/30 rotate-45 animate-time-loader transition-opacity", showAutoplayProgress ? "" : "opacity-0")} ref={progressRef} />

                <div className="relative">
                    {isPlaying ? <PauseSolid /> : <PlaySolid />}
                </div>
            </IconButton>
        </div>
    )
})

CarouselControls.displayName = "CarouselControls"

export default CarouselControls