// packages/react/accessible-icon/src/AccessibleIcon.tsx
import * as React from "react";
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var NAME = "AccessibleIcon";
var AccessibleIcon = ({ children, label }) => {
  const child = React.Children.only(children);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    React.cloneElement(child, {
      // accessibility
      "aria-hidden": "true",
      focusable: "false"
      // See: https://allyjs.io/tutorials/focusing-in-svg.html#making-svg-elements-focusable
    }),
    /* @__PURE__ */ jsx(VisuallyHiddenPrimitive.Root, { children: label })
  ] });
};
AccessibleIcon.displayName = NAME;
var Root2 = AccessibleIcon;
export {
  AccessibleIcon,
  Root2 as Root
};
//# sourceMappingURL=index.mjs.map
