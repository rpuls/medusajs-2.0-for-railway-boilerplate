import {
  Thumbnail
} from "./chunk-MNXC6Q4F.mjs";

// src/components/table/table-cells/product/product-cell/product-cell.tsx
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var ProductCell = ({ product }) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full w-full max-w-[250px] items-center gap-x-3 overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "w-fit flex-shrink-0", children: /* @__PURE__ */ jsx(Thumbnail, { src: product.thumbnail }) }),
    /* @__PURE__ */ jsx("span", { title: product.title, className: "truncate", children: product.title })
  ] });
};
var ProductHeader = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx("span", { children: t("fields.product") }) });
};

export {
  ProductCell,
  ProductHeader
};
