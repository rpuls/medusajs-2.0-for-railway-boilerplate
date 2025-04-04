import {
  IconAvatar
} from "./chunk-EQTBJSBZ.mjs";

// src/components/common/sidebar-link/sidebar-link.tsx
import { Link } from "react-router-dom";
import { Text } from "@medusajs/ui";
import { TriangleRightMini } from "@medusajs/icons";
import { jsx, jsxs } from "react/jsx-runtime";
var SidebarLink = ({
  to,
  labelKey,
  descriptionKey,
  icon
}) => {
  return /* @__PURE__ */ jsx(Link, { to, className: "group outline-none", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 px-2 pb-2", children: /* @__PURE__ */ jsx("div", { className: "shadow-elevation-card-rest bg-ui-bg-component transition-fg hover:bg-ui-bg-component-hover active:bg-ui-bg-component-pressed group-focus-visible:shadow-borders-interactive-with-active rounded-md px-4 py-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsx(IconAvatar, { children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col", children: [
      /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", weight: "plus", children: labelKey }),
      /* @__PURE__ */ jsx(
        Text,
        {
          size: "small",
          leading: "compact",
          className: "text-ui-fg-subtle",
          children: descriptionKey
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex size-7 items-center justify-center", children: /* @__PURE__ */ jsx(TriangleRightMini, { className: "text-ui-fg-muted" }) })
  ] }) }) }) });
};

export {
  SidebarLink
};
