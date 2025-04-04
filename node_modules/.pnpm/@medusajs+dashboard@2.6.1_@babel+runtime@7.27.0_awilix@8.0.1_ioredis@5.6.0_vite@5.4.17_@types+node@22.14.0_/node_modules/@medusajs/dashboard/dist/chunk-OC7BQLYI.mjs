// src/components/common/conditional-tooltip/conditional-tooltip.tsx
import { Tooltip } from "@medusajs/ui";
import { jsx } from "react/jsx-runtime";
var ConditionalTooltip = ({
  children,
  showTooltip = false,
  ...props
}) => {
  if (showTooltip) {
    return /* @__PURE__ */ jsx(Tooltip, { ...props, children });
  }
  return children;
};

export {
  ConditionalTooltip
};
