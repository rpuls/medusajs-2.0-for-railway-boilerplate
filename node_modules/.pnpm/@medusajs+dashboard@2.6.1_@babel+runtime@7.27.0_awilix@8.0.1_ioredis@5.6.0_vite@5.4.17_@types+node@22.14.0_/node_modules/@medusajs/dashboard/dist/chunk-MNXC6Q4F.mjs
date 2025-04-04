// src/components/common/thumbnail/thumbnail.tsx
import { Photo } from "@medusajs/icons";
import { clx } from "@medusajs/ui";
import { jsx } from "react/jsx-runtime";
var Thumbnail = ({ src, alt, size = "base" }) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: clx(
        "bg-ui-bg-component border-ui-border-base flex items-center justify-center overflow-hidden rounded border",
        {
          "h-8 w-6": size === "base",
          "h-5 w-4": size === "small"
        }
      ),
      children: src ? /* @__PURE__ */ jsx(
        "img",
        {
          src,
          alt,
          className: "h-full w-full object-cover object-center"
        }
      ) : /* @__PURE__ */ jsx(Photo, { className: "text-ui-fg-subtle" })
    }
  );
};

export {
  Thumbnail
};
