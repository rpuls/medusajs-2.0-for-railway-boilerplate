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
 * const props = useFormReset({ store });
 * <Form store={store}>
 *   <Role {...props}>Reset</Role>
 * </Form>
 * ```
 */
export declare const useFormReset: import("../utils/types.ts").Hook<"button", FormResetOptions<"button">>;
/**
 * Renders a button that resets the form to its initial values, as defined by
 * the
 * [`defaultValues`](https://ariakit.org/reference/use-form-store#defaultvalues)
 * prop given to the form store.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {4}
 * const form = useFormStore();
 *
 * <Form store={form}>
 *   <FormReset>Reset</FormReset>
 * </Form>
 * ```
 */
export declare const FormReset: (props: FormResetProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormResetOptions<T extends ElementType = TagName> extends ButtonOptions<T> {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest [`Form`](https://ariakit.org/reference/form) or
     * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
     * context will be used.
     */
    store?: FormStore;
}
export type FormResetProps<T extends ElementType = TagName> = Props<T, FormResetOptions<T>>;
export {};
