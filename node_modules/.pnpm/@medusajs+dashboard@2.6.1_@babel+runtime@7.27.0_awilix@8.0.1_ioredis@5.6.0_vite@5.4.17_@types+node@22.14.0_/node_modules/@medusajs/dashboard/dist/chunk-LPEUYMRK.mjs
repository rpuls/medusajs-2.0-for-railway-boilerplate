// src/components/common/skeleton/skeleton.tsx
import { Container, clx } from "@medusajs/ui";
import { jsx, jsxs } from "react/jsx-runtime";
var Skeleton = ({ className, style }) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": true,
      className: clx(
        "bg-ui-bg-component h-3 w-3 animate-pulse rounded-[4px]",
        className
      ),
      style
    }
  );
};
var TextSkeleton = ({
  size = "small",
  leading = "compact",
  characters = 10
}) => {
  let charWidth = 9;
  switch (size) {
    case "xlarge":
      charWidth = 13;
      break;
    case "large":
      charWidth = 11;
      break;
    case "base":
      charWidth = 10;
      break;
    case "small":
      charWidth = 9;
      break;
    case "xsmall":
      charWidth = 8;
      break;
  }
  return /* @__PURE__ */ jsx(
    Skeleton,
    {
      className: clx({
        "h-5": size === "xsmall",
        "h-6": size === "small",
        "h-7": size === "base",
        "h-8": size === "xlarge",
        "!h-5": leading === "compact"
      }),
      style: {
        width: `${charWidth * characters}px`
      }
    }
  );
};
var TableFooterSkeleton = ({ layout }) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: clx("flex items-center justify-between p-4", {
        "border-t": layout === "fill"
      }),
      children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-[138px]" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-2", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-24" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-11" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-11" })
        ] })
      ]
    }
  );
};
var TableSkeleton = ({
  rowCount = 10,
  search = true,
  filters = true,
  orderBy = true,
  pagination = true,
  layout = "fit"
}) => {
  const totalRowCount = rowCount + 1;
  const rows = Array.from({ length: totalRowCount }, (_, i) => i);
  const hasToolbar = search || filters || orderBy;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "aria-hidden": true,
      className: clx({
        "flex h-full flex-col overflow-hidden": layout === "fill"
      }),
      children: [
        hasToolbar && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [
          filters && /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-full max-w-[135px]" }),
          (search || orderBy) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-2", children: [
            search && /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-[160px]" }),
            orderBy && /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-7" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col divide-y border-y", children: rows.map((row) => /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full rounded-none" }, row)) }),
        pagination && /* @__PURE__ */ jsx(TableFooterSkeleton, { layout })
      ]
    }
  );
};
var SingleColumnPageSkeleton = ({
  sections = 2,
  showJSON = false,
  showMetadata = false
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-3", children: [
    Array.from({ length: sections }, (_, i) => i).map((section) => {
      return /* @__PURE__ */ jsx(
        Skeleton,
        {
          className: clx("h-full max-h-[460px] w-full rounded-lg", {
            // First section is smaller on most pages, this gives us less
            // layout shifting in general,
            "max-h-[219px]": section === 0
          })
        },
        section
      );
    }),
    showMetadata && /* @__PURE__ */ jsx(Skeleton, { className: "h-[60px] w-full rounded-lg" }),
    showJSON && /* @__PURE__ */ jsx(Skeleton, { className: "h-[60px] w-full rounded-lg" })
  ] });
};
var TwoColumnPageSkeleton = ({
  mainSections = 2,
  sidebarSections = 1,
  showJSON = false,
  showMetadata = true
}) => {
  const showExtraData = showJSON || showMetadata;
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-3", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-x-4 gap-y-3 xl:flex-row xl:items-start", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col gap-y-3", children: [
      Array.from({ length: mainSections }, (_, i) => i).map((section) => {
        return /* @__PURE__ */ jsx(
          Skeleton,
          {
            className: clx("h-full max-h-[460px] w-full rounded-lg", {
              "max-h-[219px]": section === 0
            })
          },
          section
        );
      }),
      showExtraData && /* @__PURE__ */ jsxs("div", { className: "hidden flex-col gap-y-3 xl:flex", children: [
        showMetadata && /* @__PURE__ */ jsx(Skeleton, { className: "h-[60px] w-full rounded-lg" }),
        showJSON && /* @__PURE__ */ jsx(Skeleton, { className: "h-[60px] w-full rounded-lg" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex w-full max-w-[100%] flex-col gap-y-3 xl:mt-0 xl:max-w-[440px]", children: [
      Array.from({ length: sidebarSections }, (_, i) => i).map(
        (section) => {
          return /* @__PURE__ */ jsx(
            Skeleton,
            {
              className: clx("h-full max-h-[320px] w-full rounded-lg", {
                "max-h-[140px]": section === 0
              })
            },
            section
          );
        }
      ),
      showExtraData && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-3 xl:hidden", children: [
        showMetadata && /* @__PURE__ */ jsx(Skeleton, { className: "h-[60px] w-full rounded-lg" }),
        showJSON && /* @__PURE__ */ jsx(Skeleton, { className: "h-[60px] w-full rounded-lg" })
      ] })
    ] })
  ] }) });
};

export {
  Skeleton,
  TextSkeleton,
  TableFooterSkeleton,
  TableSkeleton,
  SingleColumnPageSkeleton,
  TwoColumnPageSkeleton
};
