import {
  Form
} from "./chunk-WAYDNCEG.mjs";

// src/components/common/switch-box/switch-box.tsx
import { Switch } from "@medusajs/ui";
import { jsx, jsxs } from "react/jsx-runtime";
var SwitchBox = ({
  label,
  description,
  optional = false,
  tooltip,
  onCheckedChange,
  ...props
}) => {
  return /* @__PURE__ */ jsx(
    Form.Field,
    {
      ...props,
      render: ({ field: { value, onChange, ...field } }) => {
        return /* @__PURE__ */ jsxs(Form.Item, { children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-ui-bg-component shadow-elevation-card-rest flex items-start gap-x-3 rounded-lg p-3", children: [
            /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(Switch, { ...field, checked: value, onCheckedChange: (e) => {
              onCheckedChange?.(e);
              onChange(e);
            } }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Form.Label, { optional, tooltip, children: label }),
              /* @__PURE__ */ jsx(Form.Hint, { children: description })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Form.ErrorMessage, {})
        ] });
      }
    }
  );
};

export {
  SwitchBox
};
