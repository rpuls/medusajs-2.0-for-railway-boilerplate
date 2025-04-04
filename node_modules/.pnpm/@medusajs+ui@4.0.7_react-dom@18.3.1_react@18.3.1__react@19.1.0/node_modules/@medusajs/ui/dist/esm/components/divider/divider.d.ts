import * as React from "react";
interface DividerProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
    orientation?: "horizontal" | "vertical";
    variant?: "dashed" | "solid";
}
export declare const Divider: ({ orientation, variant, className, ...props }: DividerProps) => React.JSX.Element;
export {};
//# sourceMappingURL=divider.d.ts.map