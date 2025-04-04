import * as React from "react";
interface InlineTipProps extends React.ComponentPropsWithoutRef<"div"> {
    label: string;
    variant?: "info" | "warning" | "error" | "success";
}
/**
 * This component is based on the `div` element and supports all of its props.
 */
export declare const InlineTip: React.ForwardRefExoticComponent<InlineTipProps & React.RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=inline-tip.d.ts.map