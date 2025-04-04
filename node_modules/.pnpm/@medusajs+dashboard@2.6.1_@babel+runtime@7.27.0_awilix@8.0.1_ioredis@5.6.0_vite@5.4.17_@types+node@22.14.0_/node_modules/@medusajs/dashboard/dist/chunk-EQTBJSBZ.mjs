// src/components/common/icon-avatar/icon-avatar.tsx
import { clx } from "@medusajs/ui";
import { jsx } from "react/jsx-runtime";
var IconAvatar = ({
  size = "small",
  children,
  className
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: clx(
        "shadow-borders-base flex size-7 items-center justify-center",
        "[&>div]:bg-ui-bg-field [&>div]:text-ui-fg-subtle [&>div]:flex [&>div]:size-6 [&>div]:items-center [&>div]:justify-center",
        {
          "size-7 rounded-md [&>div]:size-6 [&>div]:rounded-[4px]": size === "small",
          "size-10 rounded-lg [&>div]:size-9 [&>div]:rounded-[6px]": size === "large",
          "size-12 rounded-xl [&>div]:size-11 [&>div]:rounded-[10px]": size === "xlarge"
        },
        className
      ),
      children: /* @__PURE__ */ jsx("div", { children })
    }
  );
};

export {
  IconAvatar
};
