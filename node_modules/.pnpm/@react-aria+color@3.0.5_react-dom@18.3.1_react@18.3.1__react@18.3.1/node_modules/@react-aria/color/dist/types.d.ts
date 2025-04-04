import { AriaColorAreaProps, AriaColorSliderProps, AriaColorWheelProps, AriaColorFieldProps, Color } from "@react-types/color";
import { ColorAreaState, ColorSliderState, ColorWheelState, ColorFieldState, ColorChannelFieldProps, ColorChannelFieldState } from "@react-stately/color";
import { DOMAttributes, RefObject, ValidationResult, AriaLabelingProps, DOMProps } from "@react-types/shared";
import { InputHTMLAttributes, LabelHTMLAttributes, RefObject as _RefObject1, HTMLAttributes } from "react";
import { NumberFieldAria } from "@react-aria/numberfield";
export interface ColorAreaAria {
    /** Props for the color area container element. */
    colorAreaProps: DOMAttributes;
    /** Props for the thumb element. */
    thumbProps: DOMAttributes;
    /** Props for the visually hidden horizontal range input element. */
    xInputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Props for the visually hidden vertical range input element. */
    yInputProps: InputHTMLAttributes<HTMLInputElement>;
}
export interface AriaColorAreaOptions extends AriaColorAreaProps {
    /** A ref to the input that represents the x axis of the color area. */
    inputXRef: RefObject<HTMLInputElement | null>;
    /** A ref to the input that represents the y axis of the color area. */
    inputYRef: RefObject<HTMLInputElement | null>;
    /** A ref to the color area containing element. */
    containerRef: RefObject<Element | null>;
}
/**
 * Provides the behavior and accessibility implementation for a color area component.
 * Color area allows users to adjust two channels of an RGB, HSL or HSB color value against a two-dimensional gradient background.
 */
export function useColorArea(props: AriaColorAreaOptions, state: ColorAreaState): ColorAreaAria;
export interface AriaColorSliderOptions extends AriaColorSliderProps {
    /** A ref for the track element. */
    trackRef: RefObject<Element | null>;
    /** A ref for the input element. */
    inputRef: RefObject<HTMLInputElement | null>;
}
export interface ColorSliderAria {
    /** Props for the label element. */
    labelProps: DOMAttributes;
    /** Props for the track element. */
    trackProps: DOMAttributes;
    /** Props for the thumb element. */
    thumbProps: DOMAttributes;
    /** Props for the visually hidden range input element. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Props for the output element, displaying the value of the color slider. */
    outputProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a color slider component.
 * Color sliders allow users to adjust an individual channel of a color value.
 */
export function useColorSlider(props: AriaColorSliderOptions, state: ColorSliderState): ColorSliderAria;
export interface AriaColorWheelOptions extends AriaColorWheelProps {
    /** The outer radius of the color wheel. */
    outerRadius: number;
    /** The inner radius of the color wheel. */
    innerRadius: number;
}
export interface ColorWheelAria {
    /** Props for the track element. */
    trackProps: DOMAttributes;
    /** Props for the thumb element. */
    thumbProps: DOMAttributes;
    /** Props for the visually hidden range input element. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
}
/**
 * Provides the behavior and accessibility implementation for a color wheel component.
 * Color wheels allow users to adjust the hue of an HSL or HSB color value on a circular track.
 */
export function useColorWheel(props: AriaColorWheelOptions, state: ColorWheelState, inputRef: RefObject<HTMLInputElement | null>): ColorWheelAria;
export interface ColorFieldAria extends ValidationResult {
    /** Props for the label element. */
    labelProps: LabelHTMLAttributes<HTMLLabelElement>;
    /** Props for the input element. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Props for the text field's description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the text field's error message element, if any. */
    errorMessageProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a color field component.
 * Color fields allow users to enter and adjust a hex color value.
 */
export function useColorField(props: AriaColorFieldProps, state: ColorFieldState, ref: _RefObject1<HTMLInputElement | null>): ColorFieldAria;
export interface AriaColorSwatchProps extends AriaLabelingProps, DOMProps {
    /** The color value to display in the swatch. */
    color?: string | Color;
    /**
     * A localized accessible name for the color.
     * By default, a description is generated from the color value,
     * but this can be overridden if you have a more specific color
     * name (e.g. Pantone colors).
     */
    colorName?: string;
}
export interface ColorSwatchAria {
    /** Props for the color swatch element. */
    colorSwatchProps: HTMLAttributes<HTMLElement>;
    /** The parsed color value of the swatch. */
    color: Color;
}
/**
 * Provides the accessibility implementation for a color swatch component.
 * A color swatch displays a preview of a selected color.
 */
export function useColorSwatch(props: AriaColorSwatchProps): ColorSwatchAria;
export interface AriaColorChannelFieldProps extends ColorChannelFieldProps, AriaLabelingProps {
}
export interface ColorChannelFieldAria extends NumberFieldAria {
}
/**
 * Provides the behavior and accessibility implementation for a color channel field, allowing users to edit the
 * value of an individual color channel.
 */
export function useColorChannelField(props: AriaColorChannelFieldProps, state: ColorChannelFieldState, inputRef: RefObject<HTMLInputElement | null>): ColorChannelFieldAria;
export type { AriaColorAreaProps, AriaColorFieldProps, AriaColorSliderProps } from '@react-types/color';

//# sourceMappingURL=types.d.ts.map
