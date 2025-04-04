// src/components/common/link-button/link-button.tsx
import { clx } from "@medusajs/ui";
import { Link } from "react-router-dom";
import { jsx } from "react/jsx-runtime";
var LinkButton = ({
  className,
  variant = "interactive",
  ...props
}) => {
  return /* @__PURE__ */ jsx(
    Link,
    {
      className: clx(
        "transition-fg txt-compact-small-plus rounded-[4px] outline-none",
        "focus-visible:shadow-borders-focus",
        {
          "text-ui-fg-interactive hover:text-ui-fg-interactive-hover": variant === "interactive",
          "text-ui-fg-base hover:text-ui-fg-subtle": variant === "primary"
        },
        className
      ),
      ...props
    }
  );
};

export {
  LinkButton
};
