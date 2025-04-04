import { AnchorHTMLAttributes, ButtonHTMLAttributes, ElementType, HTMLAttributes, InputHTMLAttributes, RefObject } from "react";
import { AriaButtonProps, AriaToggleButtonProps, AriaToggleButtonGroupItemProps } from "@react-types/button";
import { DOMAttributes, AriaLabelingProps, Orientation, RefObject as _RefObject1 } from "@react-types/shared";
import { ToggleState, ToggleGroupProps, ToggleGroupState } from "@react-stately/toggle";
export interface AriaButtonOptions<E extends ElementType> extends Omit<AriaButtonProps<E>, 'children'> {
}
export interface ButtonAria<T> {
    /** Props for the button element. */
    buttonProps: T;
    /** Whether the button is currently pressed. */
    isPressed: boolean;
}
export function useButton(props: AriaButtonOptions<'button'>, ref: RefObject<HTMLButtonElement | null>): ButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
export function useButton(props: AriaButtonOptions<'a'>, ref: RefObject<HTMLAnchorElement | null>): ButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
export function useButton(props: AriaButtonOptions<'div'>, ref: RefObject<HTMLDivElement | null>): ButtonAria<HTMLAttributes<HTMLDivElement>>;
export function useButton(props: AriaButtonOptions<'input'>, ref: RefObject<HTMLInputElement | null>): ButtonAria<InputHTMLAttributes<HTMLInputElement>>;
export function useButton(props: AriaButtonOptions<'span'>, ref: RefObject<HTMLSpanElement | null>): ButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function useButton(props: AriaButtonOptions<ElementType>, ref: RefObject<Element | null>): ButtonAria<DOMAttributes>;
interface AriaToggleButtonOptions<E extends ElementType> extends Omit<AriaToggleButtonProps<E>, 'children'> {
}
interface ToggleButtonAria<T> extends ButtonAria<T> {
    /** Whether the button is selected. */
    isSelected: boolean;
    /** Whether the button is disabled. */
    isDisabled: boolean;
}
export function useToggleButton(props: AriaToggleButtonOptions<'button'>, state: ToggleState, ref: RefObject<HTMLButtonElement | null>): ToggleButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<'a'>, state: ToggleState, ref: RefObject<HTMLAnchorElement | null>): ToggleButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<'div'>, state: ToggleState, ref: RefObject<HTMLDivElement | null>): ToggleButtonAria<HTMLAttributes<HTMLDivElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<'input'>, state: ToggleState, ref: RefObject<HTMLInputElement | null>): ToggleButtonAria<InputHTMLAttributes<HTMLInputElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<'span'>, state: ToggleState, ref: RefObject<HTMLSpanElement | null>): ToggleButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<ElementType>, state: ToggleState, ref: RefObject<Element | null>): ToggleButtonAria<DOMAttributes>;
export interface AriaToggleButtonGroupProps extends ToggleGroupProps, AriaLabelingProps {
    /**
     * The orientation of the the toggle button group.
     * @default 'horizontal'
     */
    orientation?: Orientation;
}
export interface ToggleButtonGroupAria {
    /**
     * Props for the toggle button group container.
     */
    groupProps: DOMAttributes;
}
export function useToggleButtonGroup(props: AriaToggleButtonGroupProps, state: ToggleGroupState, ref: _RefObject1<HTMLElement | null>): ToggleButtonGroupAria;
export { AriaToggleButtonGroupItemProps };
interface AriaToggleButtonGroupItemOptions<E extends ElementType> extends Omit<AriaToggleButtonGroupItemProps<E>, 'children'> {
}
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'button'>, state: ToggleGroupState, ref: _RefObject1<HTMLButtonElement | null>): ToggleButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'a'>, state: ToggleGroupState, ref: _RefObject1<HTMLAnchorElement | null>): ToggleButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'div'>, state: ToggleGroupState, ref: _RefObject1<HTMLDivElement | null>): ToggleButtonAria<HTMLAttributes<HTMLDivElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'input'>, state: ToggleGroupState, ref: _RefObject1<HTMLInputElement | null>): ToggleButtonAria<InputHTMLAttributes<HTMLInputElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'span'>, state: ToggleGroupState, ref: _RefObject1<HTMLSpanElement | null>): ToggleButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<ElementType>, state: ToggleGroupState, ref: _RefObject1<Element | null>): ToggleButtonAria<DOMAttributes>;
export type { AriaButtonProps, AriaToggleButtonProps } from '@react-types/button';

//# sourceMappingURL=types.d.ts.map
