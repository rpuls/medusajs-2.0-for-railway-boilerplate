// src/components/common/section/section-row.tsx
import { Text, clx } from "@medusajs/ui";
import { jsx, jsxs } from "react/jsx-runtime";
var SectionRow = ({ title, value, actions }) => {
  const isValueString = typeof value === "string" || !value;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: clx(
        `text-ui-fg-subtle grid w-full grid-cols-2 items-center gap-4 px-6 py-4`,
        {
          "grid-cols-[1fr_1fr_28px]": !!actions
        }
      ),
      children: [
        /* @__PURE__ */ jsx(Text, { size: "small", weight: "plus", leading: "compact", children: title }),
        isValueString ? /* @__PURE__ */ jsx(
          Text,
          {
            size: "small",
            leading: "compact",
            className: "whitespace-pre-line text-pretty",
            children: value ?? "-"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: value }),
        actions && /* @__PURE__ */ jsx("div", { children: actions })
      ]
    }
  );
};

export {
  SectionRow
};
