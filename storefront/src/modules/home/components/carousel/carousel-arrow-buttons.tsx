"use client"

import { useCallback, useEffect, useState } from "react"
import { EmblaCarouselType } from "embla-carousel"
import { IconButton } from "@medusajs/ui"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"

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

type PrevButtonProps = {
  onClick: () => void
  disabled: boolean
}

export const PrevButton = ({ onClick, disabled }: PrevButtonProps) => {
  return (
    <IconButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="transparent"
      className="rounded-full"
    >
      <ChevronLeft />
    </IconButton>
  )
}

type NextButtonProps = {
  onClick: () => void
  disabled: boolean
}

export const NextButton = ({ onClick, disabled }: NextButtonProps) => {
  return (
    <IconButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="transparent"
      className="rounded-full"
    >
      <ChevronRight />
    </IconButton>
  )
}

