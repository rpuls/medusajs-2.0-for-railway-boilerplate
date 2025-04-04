import {
  countries
} from "./chunk-VDBOSWVE.mjs";

// src/components/inputs/country-select/country-select.tsx
import {
  forwardRef,
  useImperativeHandle,
  useRef
} from "react";
import { TrianglesMini } from "@medusajs/icons";
import { clx } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var CountrySelect = forwardRef(
  ({ className, disabled, placeholder, value, defaultValue, ...props }, ref) => {
    const { t } = useTranslation();
    const innerRef = useRef(null);
    useImperativeHandle(ref, () => innerRef.current);
    const isPlaceholder = innerRef.current?.value === "";
    return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        TrianglesMini,
        {
          className: clx(
            "text-ui-fg-muted transition-fg pointer-events-none absolute right-2 top-1/2 -translate-y-1/2",
            {
              "text-ui-fg-disabled": disabled
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: value !== void 0 ? value.toLowerCase() : void 0,
          defaultValue: defaultValue ? defaultValue.toLowerCase() : void 0,
          disabled,
          className: clx(
            "bg-ui-bg-field shadow-buttons-neutral transition-fg txt-compact-small flex w-full select-none appearance-none items-center justify-between rounded-md px-2 py-1.5 outline-none",
            "placeholder:text-ui-fg-muted text-ui-fg-base",
            "hover:bg-ui-bg-field-hover",
            "focus-visible:shadow-borders-interactive-with-active data-[state=open]:!shadow-borders-interactive-with-active",
            "aria-[invalid=true]:border-ui-border-error aria-[invalid=true]:shadow-borders-error",
            "invalid::border-ui-border-error invalid:shadow-borders-error",
            "disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled",
            {
              "text-ui-fg-muted": isPlaceholder
            },
            className
          ),
          ...props,
          ref: innerRef,
          children: [
            /* @__PURE__ */ jsx("option", { value: "", disabled: true, className: "text-ui-fg-muted", children: placeholder || t("fields.selectCountry") }),
            countries.map((country) => {
              return /* @__PURE__ */ jsx("option", { value: country.iso_2.toLowerCase(), children: country.display_name }, country.iso_2);
            })
          ]
        }
      )
    ] });
  }
);
CountrySelect.displayName = "CountrySelect";

export {
  CountrySelect
};
