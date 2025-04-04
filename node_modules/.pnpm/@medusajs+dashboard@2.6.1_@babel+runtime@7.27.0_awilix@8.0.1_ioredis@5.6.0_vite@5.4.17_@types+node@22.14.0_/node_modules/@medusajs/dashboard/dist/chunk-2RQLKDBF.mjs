// src/components/layout/pages/single-column-page/single-column-page.tsx
import { Outlet } from "react-router-dom";

// src/components/common/json-view-section/json-view-section.tsx
import {
  ArrowUpRightOnBox,
  Check,
  SquareTwoStack,
  TriangleDownMini,
  XMarkMini
} from "@medusajs/icons";
import {
  Badge,
  Container,
  Drawer,
  Heading,
  IconButton,
  Kbd
} from "@medusajs/ui";
import Primitive from "@uiw/react-json-view";
import { Suspense, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var JsonViewSection = ({ data }) => {
  const { t } = useTranslation();
  const numberOfKeys = Object.keys(data).length;
  return /* @__PURE__ */ jsxs(Container, { className: "flex items-center justify-between px-6 py-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-4", children: [
      /* @__PURE__ */ jsx(Heading, { level: "h2", children: t("json.header") }),
      /* @__PURE__ */ jsx(Badge, { size: "2xsmall", rounded: "full", children: t("json.numberOfKeys", {
        count: numberOfKeys
      }) })
    ] }),
    /* @__PURE__ */ jsxs(Drawer, { children: [
      /* @__PURE__ */ jsx(Drawer.Trigger, { asChild: true, children: /* @__PURE__ */ jsx(
        IconButton,
        {
          size: "small",
          variant: "transparent",
          className: "text-ui-fg-muted hover:text-ui-fg-subtle",
          children: /* @__PURE__ */ jsx(ArrowUpRightOnBox, {})
        }
      ) }),
      /* @__PURE__ */ jsxs(Drawer.Content, { className: "bg-ui-contrast-bg-base text-ui-code-fg-subtle !shadow-elevation-commandbar overflow-hidden border border-none max-md:inset-x-2 max-md:max-w-[calc(100%-16px)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-ui-code-bg-base flex items-center justify-between px-6 py-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-4", children: [
            /* @__PURE__ */ jsx(Drawer.Title, { asChild: true, children: /* @__PURE__ */ jsx(Heading, { className: "text-ui-contrast-fg-primary", children: /* @__PURE__ */ jsx(
              Trans,
              {
                i18nKey: "json.drawer.header",
                count: numberOfKeys,
                components: [
                  /* @__PURE__ */ jsx("span", { className: "text-ui-fg-subtle" }, "count-span")
                ]
              }
            ) }) }),
            /* @__PURE__ */ jsx(Drawer.Description, { className: "sr-only", children: t("json.drawer.description") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-2", children: [
            /* @__PURE__ */ jsx(Kbd, { className: "bg-ui-contrast-bg-subtle border-ui-contrast-border-base text-ui-contrast-fg-secondary", children: "esc" }),
            /* @__PURE__ */ jsx(Drawer.Close, { asChild: true, children: /* @__PURE__ */ jsx(
              IconButton,
              {
                size: "small",
                variant: "transparent",
                className: "text-ui-contrast-fg-secondary hover:text-ui-contrast-fg-primary hover:bg-ui-contrast-bg-base-hover active:bg-ui-contrast-bg-base-pressed focus-visible:bg-ui-contrast-bg-base-hover focus-visible:shadow-borders-interactive-with-active",
                children: /* @__PURE__ */ jsx(XMarkMini, {})
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Drawer.Body, { className: "flex flex-1 flex-col overflow-hidden px-[5px] py-0 pb-[5px]", children: /* @__PURE__ */ jsx("div", { className: "bg-ui-contrast-bg-subtle flex-1 overflow-auto rounded-b-[4px] rounded-t-lg p-3", children: /* @__PURE__ */ jsx(
          Suspense,
          {
            fallback: /* @__PURE__ */ jsx("div", { className: "flex size-full flex-col" }),
            children: /* @__PURE__ */ jsxs(
              Primitive,
              {
                value: data,
                displayDataTypes: false,
                style: {
                  "--w-rjv-font-family": "Roboto Mono, monospace",
                  "--w-rjv-line-color": "var(--contrast-border-base)",
                  "--w-rjv-curlybraces-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-brackets-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-key-string": "var(--contrast-fg-primary)",
                  "--w-rjv-info-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-type-string-color": "var(--tag-green-icon)",
                  "--w-rjv-quotes-string-color": "var(--tag-green-icon)",
                  "--w-rjv-type-boolean-color": "var(--tag-orange-icon)",
                  "--w-rjv-type-int-color": "var(--tag-orange-icon)",
                  "--w-rjv-type-float-color": "var(--tag-orange-icon)",
                  "--w-rjv-type-bigint-color": "var(--tag-orange-icon)",
                  "--w-rjv-key-number": "var(--contrast-fg-secondary)",
                  "--w-rjv-arrow-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-copied-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-copied-success-color": "var(--contrast-fg-primary)",
                  "--w-rjv-colon-color": "var(--contrast-fg-primary)",
                  "--w-rjv-ellipsis-color": "var(--contrast-fg-secondary)"
                },
                collapsed: 1,
                children: [
                  /* @__PURE__ */ jsx(Primitive.Quote, { render: () => /* @__PURE__ */ jsx("span", {}) }),
                  /* @__PURE__ */ jsx(
                    Primitive.Null,
                    {
                      render: () => /* @__PURE__ */ jsx("span", { className: "text-ui-tag-red-icon", children: "null" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Primitive.Undefined,
                    {
                      render: () => /* @__PURE__ */ jsx("span", { className: "text-ui-tag-blue-icon", children: "undefined" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Primitive.CountInfo,
                    {
                      render: (_props, { value }) => {
                        return /* @__PURE__ */ jsx("span", { className: "text-ui-contrast-fg-secondary ml-2", children: t("general.items", {
                          count: Object.keys(value).length
                        }) });
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(Primitive.Arrow, { children: /* @__PURE__ */ jsx(TriangleDownMini, { className: "text-ui-contrast-fg-secondary -ml-[0.5px]" }) }),
                  /* @__PURE__ */ jsx(Primitive.Colon, { children: /* @__PURE__ */ jsx("span", { className: "mr-1", children: ":" }) }),
                  /* @__PURE__ */ jsx(
                    Primitive.Copied,
                    {
                      render: ({ style }, { value }) => {
                        return /* @__PURE__ */ jsx(Copied, { style, value });
                      }
                    }
                  )
                ]
              }
            )
          }
        ) }) })
      ] })
    ] })
  ] });
};
var Copied = ({ style, value }) => {
  const [copied, setCopied] = useState(false);
  const handler = (e) => {
    e.stopPropagation();
    setCopied(true);
    if (typeof value === "string") {
      navigator.clipboard.writeText(value);
    } else {
      const json = JSON.stringify(value, null, 2);
      navigator.clipboard.writeText(json);
    }
    setTimeout(() => {
      setCopied(false);
    }, 2e3);
  };
  const styl = { whiteSpace: "nowrap", width: "20px" };
  if (copied) {
    return /* @__PURE__ */ jsx("span", { style: { ...style, ...styl }, children: /* @__PURE__ */ jsx(Check, { className: "text-ui-contrast-fg-primary" }) });
  }
  return /* @__PURE__ */ jsx("span", { style: { ...style, ...styl }, onClick: handler, children: /* @__PURE__ */ jsx(SquareTwoStack, { className: "text-ui-contrast-fg-secondary" }) });
};

// src/components/common/metadata-section/metadata-section.tsx
import { ArrowUpRightOnBox as ArrowUpRightOnBox2 } from "@medusajs/icons";
import { Badge as Badge2, Container as Container2, Heading as Heading2, IconButton as IconButton2 } from "@medusajs/ui";
import { useTranslation as useTranslation2 } from "react-i18next";
import { Link } from "react-router-dom";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var MetadataSection = ({
  data,
  href = "metadata/edit"
}) => {
  const { t } = useTranslation2();
  if (!data) {
    return null;
  }
  if (!("metadata" in data)) {
    return null;
  }
  const numberOfKeys = data.metadata ? Object.keys(data.metadata).length : 0;
  return /* @__PURE__ */ jsxs2(Container2, { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-x-3", children: [
      /* @__PURE__ */ jsx2(Heading2, { level: "h2", children: t("metadata.header") }),
      /* @__PURE__ */ jsx2(Badge2, { size: "2xsmall", rounded: "full", children: t("metadata.numberOfKeys", {
        count: numberOfKeys
      }) })
    ] }),
    /* @__PURE__ */ jsx2(
      IconButton2,
      {
        size: "small",
        variant: "transparent",
        className: "text-ui-fg-muted hover:text-ui-fg-subtle",
        asChild: true,
        children: /* @__PURE__ */ jsx2(Link, { to: href, children: /* @__PURE__ */ jsx2(ArrowUpRightOnBox2, {}) })
      }
    )
  ] });
};

// src/components/layout/pages/single-column-page/single-column-page.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
import { createElement } from "react";
var SingleColumnPage = ({
  children,
  widgets,
  /**
   * Data of the page which is passed to Widgets, JSON view, and Metadata view.
   */
  data,
  /**
   * Whether the page should render an outlet for children routes. Defaults to true.
   */
  hasOutlet = true,
  /**
   * Whether to show JSON view of the data. Defaults to false.
   */
  showJSON,
  /**
   * Whether to show metadata view of the data. Defaults to false.
   */
  showMetadata
}) => {
  const { before, after } = widgets;
  const widgetProps = { data };
  if (showJSON && !data) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "`showJSON` is true but no data is provided. To display JSON, provide data prop."
      );
    }
    showJSON = false;
  }
  if (showMetadata && !data) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "`showMetadata` is true but no data is provided. To display metadata, provide data prop."
      );
    }
    showMetadata = false;
  }
  return /* @__PURE__ */ jsxs3("div", { className: "flex flex-col gap-y-3", children: [
    before.map((Component, i) => {
      return /* @__PURE__ */ createElement(Component, { ...widgetProps, key: i });
    }),
    children,
    after.map((Component, i) => {
      return /* @__PURE__ */ createElement(Component, { ...widgetProps, key: i });
    }),
    showMetadata && /* @__PURE__ */ jsx3(MetadataSection, { data }),
    showJSON && /* @__PURE__ */ jsx3(JsonViewSection, { data }),
    hasOutlet && /* @__PURE__ */ jsx3(Outlet, {})
  ] });
};

// src/components/layout/pages/two-column-page/two-column-page.tsx
import { clx } from "@medusajs/ui";
import { Children } from "react";
import { Outlet as Outlet2 } from "react-router-dom";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
import { createElement as createElement2 } from "react";
var Root = ({
  children,
  /**
   * Widgets to be rendered in the main content area and sidebar.
   */
  widgets,
  /**
   * Data to be passed to widgets, JSON view, and Metadata view.
   */
  data,
  /**
   * Whether to show JSON view of the data. Defaults to false.
   */
  showJSON = false,
  /**
   * Whether to show metadata view of the data. Defaults to false.
   */
  showMetadata = false,
  /**
   * Whether to render an outlet for children routes. Defaults to true.
   */
  hasOutlet = true
}) => {
  const widgetProps = { data };
  const { before, after, sideBefore, sideAfter } = widgets;
  if (showJSON && !data) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "`showJSON` is true but no data is provided. To display JSON, provide data prop."
      );
    }
    showJSON = false;
  }
  if (showMetadata && !data) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "`showMetadata` is true but no data is provided. To display metadata, provide data prop."
      );
    }
    showMetadata = false;
  }
  const childrenArray = Children.toArray(children);
  if (childrenArray.length !== 2) {
    throw new Error("TwoColumnPage expects exactly two children");
  }
  const [main, sidebar] = childrenArray;
  const showExtraData = showJSON || showMetadata;
  return /* @__PURE__ */ jsxs4("div", { className: "flex w-full flex-col gap-y-3", children: [
    before.map((Component, i) => {
      return /* @__PURE__ */ createElement2(Component, { ...widgetProps, key: i });
    }),
    /* @__PURE__ */ jsxs4("div", { className: "flex w-full flex-col items-start gap-x-4 gap-y-3 xl:grid xl:grid-cols-[minmax(0,_1fr)_440px]", children: [
      /* @__PURE__ */ jsxs4("div", { className: "flex w-full min-w-0 flex-col gap-y-3", children: [
        main,
        after.map((Component, i) => {
          return /* @__PURE__ */ createElement2(Component, { ...widgetProps, key: i });
        }),
        showExtraData && /* @__PURE__ */ jsxs4("div", { className: "hidden flex-col gap-y-3 xl:flex", children: [
          showMetadata && /* @__PURE__ */ jsx4(MetadataSection, { data }),
          showJSON && /* @__PURE__ */ jsx4(JsonViewSection, { data })
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "flex w-full flex-col gap-y-3 xl:mt-0", children: [
        sideBefore.map((Component, i) => {
          return /* @__PURE__ */ createElement2(Component, { ...widgetProps, key: i });
        }),
        sidebar,
        sideAfter.map((Component, i) => {
          return /* @__PURE__ */ createElement2(Component, { ...widgetProps, key: i });
        }),
        showExtraData && /* @__PURE__ */ jsxs4("div", { className: "flex flex-col gap-y-3 xl:hidden", children: [
          showMetadata && /* @__PURE__ */ jsx4(MetadataSection, { data }),
          showJSON && /* @__PURE__ */ jsx4(JsonViewSection, { data })
        ] })
      ] })
    ] }),
    hasOutlet && /* @__PURE__ */ jsx4(Outlet2, {})
  ] });
};
var Main = ({
  children,
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsx4("div", { className: clx("flex w-full flex-col gap-y-3", className), ...props, children });
};
var Sidebar = ({
  children,
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsx4(
    "div",
    {
      className: clx(
        "flex w-full max-w-[100%] flex-col gap-y-3 xl:mt-0 xl:max-w-[440px]",
        className
      ),
      ...props,
      children
    }
  );
};
var TwoColumnPage = Object.assign(Root, { Main, Sidebar });

export {
  JsonViewSection,
  SingleColumnPage,
  TwoColumnPage
};
