import {
  useDebouncedSearch
} from "./chunk-6CNRNROJ.mjs";
import {
  TextSkeleton
} from "./chunk-LPEUYMRK.mjs";
import {
  useProductCategories
} from "./chunk-2XA3IEXQ.mjs";

// src/routes/products/common/components/category-combobox/category-combobox.tsx
import {
  ArrowUturnLeft,
  EllipseMiniSolid,
  TriangleRightMini,
  TrianglesMini,
  XMarkMini
} from "@medusajs/icons";
import { Divider, Text, clx } from "@medusajs/ui";
import { Popover as RadixPopover } from "radix-ui";
import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { Trans, useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var TABLUAR_NUM_WIDTH = 8;
var TAG_BASE_WIDTH = 28;
var CategoryCombobox = forwardRef(({ value, onChange, className, ...props }, ref) => {
  const innerRef = useRef(null);
  useImperativeHandle(
    ref,
    () => innerRef.current,
    []
  );
  const [open, setOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const [level, setLevel] = useState([]);
  const { searchValue, onSearchValueChange, query } = useDebouncedSearch();
  const { product_categories, isPending, isError, error } = useProductCategories(
    {
      q: query,
      parent_category_id: !searchValue ? getParentId(level) : void 0,
      include_descendants_tree: !searchValue ? true : false
    },
    {
      enabled: open
    }
  );
  const [showLoading, setShowLoading] = useState(false);
  useEffect(() => {
    let timeoutId;
    if (isPending) {
      setShowLoading(true);
    } else {
      timeoutId = setTimeout(() => {
        setShowLoading(false);
      }, 150);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPending]);
  useEffect(() => {
    if (searchValue) {
      setLevel([]);
    }
  }, [searchValue]);
  function handleLevelUp(e) {
    e.preventDefault();
    e.stopPropagation();
    setLevel(level.slice(0, level.length - 1));
    innerRef.current?.focus();
  }
  function handleLevelDown(option) {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      setLevel([...level, { id: option.value, label: option.label }]);
      innerRef.current?.focus();
    };
  }
  const handleSelect = useCallback(
    (option) => {
      return (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSelected(value, option.value)) {
          onChange(value.filter((v) => v !== option.value));
        } else {
          onChange([...value, option.value]);
        }
        innerRef.current?.focus();
      };
    },
    [value, onChange]
  );
  function handleOpenChange(open2) {
    if (!open2) {
      onSearchValueChange("");
      setLevel([]);
    }
    if (open2) {
      requestAnimationFrame(() => {
        innerRef.current?.focus();
      });
    }
    setOpen(open2);
  }
  const options = getOptions(product_categories || []);
  const showTag = value.length > 0;
  const showSelected = !open && value.length > 0;
  const tagWidth = useMemo(() => {
    const count = value.length;
    const digits = count.toString().length;
    return TAG_BASE_WIDTH + digits * TABLUAR_NUM_WIDTH;
  }, [value]);
  const showLevelUp = !searchValue && level.length > 0;
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const handleKeyDown = useCallback(
    (e) => {
      if (!open) {
        return;
      }
      const optionsLength = showLevelUp ? options.length + 1 : options.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const nextIndex = prev < optionsLength - 1 ? prev + 1 : prev;
          return nextIndex;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          return prev > 0 ? prev - 1 : prev;
        });
      } else if (e.key === "ArrowRight") {
        const index = showLevelUp ? focusedIndex - 1 : focusedIndex;
        const hasChildren = options[index]?.has_children;
        if (!hasChildren || !!searchValue) {
          return;
        }
        e.preventDefault();
        setLevel([
          ...level,
          {
            id: options[index].value,
            label: options[index].label
          }
        ]);
        setFocusedIndex(0);
      } else if (e.key === "Enter" && focusedIndex !== -1) {
        e.preventDefault();
        if (showLevelUp && focusedIndex === 0) {
          setLevel(level.slice(0, level.length - 1));
          setFocusedIndex(0);
          return;
        }
        const index = showLevelUp ? focusedIndex - 1 : focusedIndex;
        handleSelect(options[index])(e);
      }
    },
    [open, focusedIndex, options, level, handleSelect, searchValue, showLevelUp]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsxs(RadixPopover.Root, { open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsx(
      RadixPopover.Anchor,
      {
        asChild: true,
        onClick: () => {
          if (!open) {
            handleOpenChange(true);
          }
        },
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            "data-anchor": true,
            className: clx(
              "relative flex cursor-pointer items-center gap-x-2 overflow-hidden",
              "h-8 w-full rounded-md",
              "bg-ui-bg-field transition-fg shadow-borders-base",
              "has-[input:focus]:shadow-borders-interactive-with-active",
              "has-[:invalid]:shadow-borders-error has-[[aria-invalid=true]]:shadow-borders-error",
              "has-[:disabled]:bg-ui-bg-disabled has-[:disabled]:text-ui-fg-disabled has-[:disabled]:cursor-not-allowed",
              {
                // Fake the focus state as long as the popover is open,
                // this prevents the styling from flickering when navigating
                // between levels.
                "shadow-borders-interactive-with-active": open
              },
              className
            ),
            style: {
              "--tag-width": `${tagWidth}px`
            },
            children: [
              showTag && /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: (e) => {
                    e.preventDefault();
                    onChange([]);
                  },
                  className: "bg-ui-bg-base hover:bg-ui-bg-base-hover txt-compact-small-plus text-ui-fg-subtle focus-within:border-ui-fg-interactive transition-fg absolute left-0.5 top-0.5 flex h-[28px] items-center rounded-[4px] border py-[3px] pl-1.5 pr-1 outline-none",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: value.length }),
                    /* @__PURE__ */ jsx(XMarkMini, { className: "text-ui-fg-muted" })
                  ]
                }
              ),
              showSelected && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 left-[calc(var(--tag-width)+8px)] flex size-full items-center", children: /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", children: t("general.selected") }) }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: innerRef,
                  value: searchValue,
                  onChange: (e) => {
                    onSearchValueChange(e.target.value);
                  },
                  className: clx(
                    "txt-compact-small size-full cursor-pointer appearance-none bg-transparent pr-8 outline-none",
                    "hover:bg-ui-bg-field-hover",
                    "focus:cursor-text",
                    "placeholder:text-ui-fg-muted",
                    {
                      "pl-2": !showTag,
                      "pl-[calc(var(--tag-width)+8px)]": showTag
                    }
                  ),
                  ...props
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleOpenChange(true),
                  className: "text-ui-fg-muted transition-fg hover:bg-ui-bg-field-hover absolute right-0 flex size-8 items-center justify-center rounded-r outline-none",
                  children: /* @__PURE__ */ jsx(TrianglesMini, { className: "text-ui-fg-muted" })
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs(
      RadixPopover.Content,
      {
        sideOffset: 4,
        role: "listbox",
        className: clx(
          "shadow-elevation-flyout bg-ui-bg-base -left-2 z-50 w-[var(--radix-popper-anchor-width)] rounded-[8px]",
          "max-h-[200px] overflow-y-auto",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        ),
        onInteractOutside: (e) => {
          e.preventDefault();
          const target = e.target;
          if (target.closest("[data-anchor]")) {
            return;
          }
          handleOpenChange(false);
        },
        children: [
          showLevelUp && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "p-1", children: /* @__PURE__ */ jsxs(
              "button",
              {
                "data-active": focusedIndex === 0,
                role: "button",
                className: clx(
                  "transition-fg grid w-full appearance-none grid-cols-[20px_1fr] items-center justify-center gap-2 rounded-md px-2 py-1.5 text-left outline-none",
                  "data-[active=true]:bg-ui-bg-field-hover"
                ),
                type: "button",
                onClick: handleLevelUp,
                onMouseEnter: () => setFocusedIndex(0),
                onMouseLeave: () => setFocusedIndex(-1),
                tabIndex: -1,
                children: [
                  /* @__PURE__ */ jsx(ArrowUturnLeft, { className: "text-ui-fg-muted" }),
                  /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", children: getParentLabel(level) })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(Divider, {})
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-1", children: [
            options.length > 0 && !showLoading && options.map((option, index) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: clx(
                  "transition-fg bg-ui-bg-base grid cursor-pointer grid-cols-1 items-center gap-2 overflow-hidden",
                  {
                    "grid-cols-[1fr_32px]": option.has_children && !searchValue
                  }
                ),
                children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      "data-active": showLevelUp ? focusedIndex === index + 1 : focusedIndex === index,
                      type: "button",
                      role: "option",
                      className: clx(
                        "grid h-full w-full appearance-none grid-cols-[20px_1fr] items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left outline-none",
                        "data-[active=true]:bg-ui-bg-field-hover"
                      ),
                      onClick: handleSelect(option),
                      onMouseEnter: () => setFocusedIndex(showLevelUp ? index + 1 : index),
                      onMouseLeave: () => setFocusedIndex(-1),
                      tabIndex: -1,
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "flex size-5 items-center justify-center", children: isSelected(value, option.value) && /* @__PURE__ */ jsx(EllipseMiniSolid, {}) }),
                        /* @__PURE__ */ jsx(
                          Text,
                          {
                            as: "span",
                            size: "small",
                            leading: "compact",
                            className: "w-full truncate",
                            children: option.label
                          }
                        )
                      ]
                    }
                  ),
                  option.has_children && !searchValue && /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: clx(
                        "text-ui-fg-muted flex size-8 appearance-none items-center justify-center rounded-md outline-none",
                        "hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed"
                      ),
                      type: "button",
                      onClick: handleLevelDown(option),
                      tabIndex: -1,
                      children: /* @__PURE__ */ jsx(TriangleRightMini, {})
                    }
                  )
                ]
              },
              option.value
            )),
            showLoading && Array.from({ length: 5 }).map((_, index) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "grid grid-cols-[20px_1fr_20px] gap-2 px-2 py-1.5",
                children: [
                  /* @__PURE__ */ jsx("div", {}),
                  /* @__PURE__ */ jsx(TextSkeleton, { size: "small", leading: "compact" }),
                  /* @__PURE__ */ jsx("div", {})
                ]
              },
              index
            )),
            options.length === 0 && !showLoading && /* @__PURE__ */ jsx("div", { className: "px-2 py-1.5", children: /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", children: query ? /* @__PURE__ */ jsx(
              Trans,
              {
                i18n,
                i18nKey: "general.noResultsTitle",
                tOptions: {
                  query
                },
                components: [/* @__PURE__ */ jsx("span", { className: "font-medium" }, "query")]
              }
            ) : t("general.noResultsTitle") }) })
          ] })
        ]
      }
    )
  ] });
});
CategoryCombobox.displayName = "CategoryCombobox";
function getParentId(level) {
  if (!level.length) {
    return "null";
  }
  return level[level.length - 1].id;
}
function getParentLabel(level) {
  if (!level.length) {
    return null;
  }
  return level[level.length - 1].label;
}
function getOptions(categories) {
  return categories.map((cat) => {
    return {
      value: cat.id,
      label: cat.name,
      has_children: cat.category_children?.length > 0
    };
  });
}
function isSelected(values, value) {
  return values.includes(value);
}

export {
  CategoryCombobox
};
