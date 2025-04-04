import { AriaSliderProps, AriaSliderThumbProps } from "@react-types/slider";
import { DOMAttributes, RefObject } from "@react-types/shared";
import { LabelHTMLAttributes, OutputHTMLAttributes, InputHTMLAttributes } from "react";
import { SliderState } from "@react-stately/slider";
export interface SliderAria {
    /** Props for the label element. */
    labelProps: LabelHTMLAttributes<HTMLLabelElement>;
    /** Props for the root element of the slider component; groups slider inputs. */
    groupProps: DOMAttributes;
    /** Props for the track element. */
    trackProps: DOMAttributes;
    /** Props for the output element, displaying the value of the slider thumbs. */
    outputProps: OutputHTMLAttributes<HTMLOutputElement>;
}
/**
 * Provides the behavior and accessibility implementation for a slider component representing one or more values.
 *
 * @param props Props for the slider.
 * @param state State for the slider, as returned by `useSliderState`.
 * @param trackRef Ref for the "track" element.  The width of this element provides the "length"
 * of the track -- the span of one dimensional space that the slider thumb can be.  It also
 * accepts click and drag motions, so that the closest thumb will follow clicks and drags on
 * the track.
 */
export function useSlider<T extends number | number[]>(props: AriaSliderProps<T>, state: SliderState, trackRef: RefObject<Element | null>): SliderAria;
export interface SliderThumbAria {
    /** Props for the root thumb element; handles the dragging motion. */
    thumbProps: DOMAttributes;
    /** Props for the visually hidden range input element. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Props for the label element for this thumb (optional). */
    labelProps: LabelHTMLAttributes<HTMLLabelElement>;
    /** Whether this thumb is currently being dragged. */
    isDragging: boolean;
    /** Whether the thumb is currently focused. */
    isFocused: boolean;
    /** Whether the thumb is disabled. */
    isDisabled: boolean;
}
export interface AriaSliderThumbOptions extends AriaSliderThumbProps {
    /** A ref to the track element. */
    trackRef: RefObject<Element | null>;
    /** A ref to the thumb input element. */
    inputRef: RefObject<HTMLInputElement | null>;
}
/**
 * Provides behavior and accessibility for a thumb of a slider component.
 *
 * @param opts Options for this Slider thumb.
 * @param state Slider state, created via `useSliderState`.
 */
export function useSliderThumb(opts: AriaSliderThumbOptions, state: SliderState): SliderThumbAria;
export type { AriaSliderProps } from '@react-types/slider';
export type { AriaSliderThumbProps } from '@react-types/slider';
export type { Orientation } from '@react-types/shared';

//# sourceMappingURL=types.d.ts.map
