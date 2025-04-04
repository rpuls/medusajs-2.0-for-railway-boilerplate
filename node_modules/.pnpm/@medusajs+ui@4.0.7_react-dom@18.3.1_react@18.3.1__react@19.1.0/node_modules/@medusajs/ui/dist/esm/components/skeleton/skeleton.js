import * as React from "react";
import { clx } from "../../utils/clx";
function Skeleton({ className, ...props }) {
    return (React.createElement("div", { className: clx("bg-ui-bg-component animate-pulse rounded-md", className), ...props }));
}
export { Skeleton };
//# sourceMappingURL=skeleton.js.map