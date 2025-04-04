import type { ElementType } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import type { Props } from "../utils/types.ts";
import type { FormStore } from "./form-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormReset` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore();
 * const props = useFormSubmit({ store });
 * <Form store={store}>
 *   <Role {...props}>Submit</Role>
 * </Form>
 * ```
 */
export declare const useFormSubmit: import("../utils/types.ts").Hook<"button", FormSubmitOptions<"button">>;
/**
 * Renders a native submit button inside a form. The button will be
 * [`disabled`](https://ariakit.org/reference/form-submit#disabled) while the
 * form is submitting, but it will remain accessible to keyboard and screen
 * reader users thanks to the
 * [`accessibleWhenDisabled`](https://ariakit.org/reference/form-submit#accessiblewhendisabled)
 * prop that's enabled by default.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {4}
 * const form = useFormStore();
 *
 * <Form store={form}>
 *   <FormSubmit>Submit</FormSubmit>
 * </Form>
 * ```
 */
export declare const FormSubmit: (props: FormSubmitProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormSubmitOptions<T extends ElementType = TagName> extends ButtonOptions<T> {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest [`Form`](https://ariakit.org/reference/form) or
     * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
     * context will be used.
     */
    store?: FormStore;
    /**
     * @default true
     */
    accessibleWhenDisabled?: ButtonOptions<T>["accessibleWhenDisabled"];
}
export type FormSubmitProps<T extends ElementType = TagName> = Props<T, FormSubmitOptions<T>>;
export {};
