// src/components/table/table-cells/common/status-cell/status-cell.tsx
import { clx } from "@medusajs/ui";
import { jsx, jsxs } from "react/jsx-runtime";
var StatusCell = ({ color, children }) => {
  return /* @__PURE__ */ jsxs("div", { className: "txt-compact-small text-ui-fg-subtle flex h-full w-full items-center gap-x-2 overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        role: "presentation",
        className: "flex h-5 w-2 items-center justify-center",
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: clx(
              "h-2 w-2 rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.12)_inset]",
              {
                "bg-ui-tag-neutral-icon": color === "grey",
                "bg-ui-tag-green-icon": color === "green",
                "bg-ui-tag-red-icon": color === "red",
                "bg-ui-tag-blue-icon": color === "blue",
                "bg-ui-tag-orange-icon": color === "orange",
                "bg-ui-tag-purple-icon": color === "purple"
              }
            )
          }
        )
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "truncate", children })
  ] });
};

export {
  StatusCell
};
