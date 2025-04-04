// src/components/inputs/handle-input/handle-input.tsx
import { Input, Text } from "@medusajs/ui";
import { forwardRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var HandleInput = forwardRef((props, ref) => {
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 z-10 flex w-8 items-center justify-center border-r", children: /* @__PURE__ */ jsx(
      Text,
      {
        className: "text-ui-fg-muted",
        size: "small",
        leading: "compact",
        weight: "plus",
        children: "/"
      }
    ) }),
    /* @__PURE__ */ jsx(Input, { ref, ...props, className: "pl-10" })
  ] });
});
HandleInput.displayName = "HandleInput";

export {
  HandleInput
};
