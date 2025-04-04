// src/components/inputs/combobox/combobox.tsx
import {
  Combobox as PrimitiveCombobox,
  ComboboxDisclosure as PrimitiveComboboxDisclosure,
  ComboboxItem as PrimitiveComboboxItem,
  ComboboxItemCheck as PrimitiveComboboxItemCheck,
  ComboboxItemValue as PrimitiveComboboxItemValue,
  ComboboxPopover as PrimitiveComboboxPopover,
  ComboboxProvider as PrimitiveComboboxProvider,
  Separator as PrimitiveSeparator
} from "@ariakit/react";
import {
  CheckMini,
  EllipseMiniSolid,
  PlusMini,
  TrianglesMini,
  XMarkMini
} from "@medusajs/icons";
import { clx, Text } from "@medusajs/ui";
import { matchSorter } from "match-sorter";
import {
  Fragment,
  useCallback,
  useDeferredValue,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useTransition
} from "react";
import { useTranslation } from "react-i18next";

// src/components/utilities/generic-forward-ref/generic-forward-ref.tsx
import { forwardRef } from "react";
function genericForwardRef(render) {
  return forwardRef(render);
}

// src/components/inputs/combobox/combobox.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var TABLUAR_NUM_WIDTH = 8;
var TAG_BASE_WIDTH = 28;
var ComboboxImpl = ({
  value: controlledValue,
  onChange,
  searchValue: controlledSearchValue,
  onSearchValueChange,
  options,
  className,
  placeholder,
  fetchNextPage,
  isFetchingNextPage,
  onCreateOption,
  noResultsPlaceholder,
  allowClear,
  ...inputProps
}, ref) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();
  const comboboxRef = useRef(null);
  const listboxRef = useRef(null);
  useImperativeHandle(ref, () => comboboxRef.current);
  const isValueControlled = controlledValue !== void 0;
  const isSearchControlled = controlledSearchValue !== void 0;
  const isArrayValue = Array.isArray(controlledValue);
  const emptyState = isArrayValue ? [] : "";
  const [uncontrolledSearchValue, setUncontrolledSearchValue] = useState(
    controlledSearchValue || ""
  );
  const defferedSearchValue = useDeferredValue(uncontrolledSearchValue);
  const [uncontrolledValue, setUncontrolledValue] = useState(emptyState);
  const searchValue = isSearchControlled ? controlledSearchValue : uncontrolledSearchValue;
  const selectedValues = isValueControlled ? controlledValue : uncontrolledValue;
  const handleValueChange = (newValues) => {
    const exists = options.filter((o) => !o.disabled).find((o) => {
      if (isArrayValue) {
        return newValues?.includes(o.value);
      }
      return o.value === newValues;
    });
    if (!exists && onCreateOption && newValues) {
      onCreateOption(newValues);
    }
    if (!isValueControlled) {
      setUncontrolledValue(newValues || emptyState);
    }
    if (onChange) {
      onChange(newValues);
    }
    setUncontrolledSearchValue("");
  };
  const handleSearchChange = (query) => {
    setUncontrolledSearchValue(query);
    if (onSearchValueChange) {
      onSearchValueChange(query);
    }
  };
  const matches = useMemo(() => {
    if (isSearchControlled) {
      return [];
    }
    return matchSorter(options, defferedSearchValue, {
      keys: ["label"]
    });
  }, [options, defferedSearchValue, isSearchControlled]);
  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          fetchNextPage?.();
        }
      },
      { threshold: 1 }
    )
  );
  const lastOptionRef = useCallback(
    (node) => {
      if (isFetchingNextPage) {
        return;
      }
      if (observer.current) {
        observer.current.disconnect();
      }
      if (node) {
        observer.current.observe(node);
      }
    },
    [isFetchingNextPage]
  );
  const handleOpenChange = (open2) => {
    if (!open2) {
      setUncontrolledSearchValue("");
    }
    setOpen(open2);
  };
  const hasValue = selectedValues?.length > 0;
  const showTag = hasValue && isArrayValue;
  const showSelected = showTag && !searchValue && !open;
  const hideInput = !isArrayValue && !open;
  const selectedLabel = options.find((o) => o.value === selectedValues)?.label;
  const hidePlaceholder = showSelected || open;
  const tagWidth = useMemo(() => {
    if (!Array.isArray(selectedValues)) {
      return TAG_BASE_WIDTH + TABLUAR_NUM_WIDTH;
    }
    const count = selectedValues.length;
    const digits = count.toString().length;
    return TAG_BASE_WIDTH + digits * TABLUAR_NUM_WIDTH;
  }, [selectedValues]);
  const results = useMemo(() => {
    return isSearchControlled ? options : matches;
  }, [matches, options, isSearchControlled]);
  return /* @__PURE__ */ jsxs(
    PrimitiveComboboxProvider,
    {
      open,
      setOpen: handleOpenChange,
      selectedValue: selectedValues,
      setSelectedValue: (value) => handleValueChange(value),
      value: uncontrolledSearchValue,
      setValue: (query) => {
        startTransition(() => handleSearchChange(query));
      },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: clx(
              "relative flex cursor-pointer items-center gap-x-2 overflow-hidden",
              "h-8 w-full rounded-md",
              "bg-ui-bg-field transition-fg shadow-borders-base",
              "has-[input:focus]:shadow-borders-interactive-with-active",
              "has-[:invalid]:shadow-borders-error has-[[aria-invalid=true]]:shadow-borders-error",
              "has-[:disabled]:bg-ui-bg-disabled has-[:disabled]:text-ui-fg-disabled has-[:disabled]:cursor-not-allowed",
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
                    handleValueChange(void 0);
                  },
                  className: "bg-ui-bg-base hover:bg-ui-bg-base-hover txt-compact-small-plus text-ui-fg-subtle focus-within:border-ui-fg-interactive transition-fg absolute left-0.5 top-0.5 z-[1] flex h-[28px] items-center rounded-[4px] border py-[3px] pl-1.5 pr-1 outline-none",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: selectedValues.length }),
                    /* @__PURE__ */ jsx(XMarkMini, { className: "text-ui-fg-muted" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "relative flex size-full items-center", children: [
                showSelected && /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: clx(
                      "pointer-events-none absolute inset-y-0 flex size-full items-center",
                      {
                        "left-[calc(var(--tag-width)+8px)]": showTag,
                        "left-2": !showTag
                      }
                    ),
                    children: /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", children: t("general.selected") })
                  }
                ),
                hideInput && /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: clx(
                      "pointer-events-none absolute inset-y-0 flex size-full items-center overflow-hidden",
                      {
                        "left-[calc(var(--tag-width)+8px)]": showTag,
                        "left-2": !showTag
                      }
                    ),
                    children: /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", className: "truncate", children: selectedLabel })
                  }
                ),
                /* @__PURE__ */ jsx(
                  PrimitiveCombobox,
                  {
                    autoSelect: true,
                    ref: comboboxRef,
                    onFocus: () => setOpen(true),
                    className: clx(
                      "txt-compact-small text-ui-fg-base !placeholder:text-ui-fg-muted transition-fg size-full cursor-pointer bg-transparent pl-2 pr-8 outline-none focus:cursor-text",
                      "hover:bg-ui-bg-field-hover",
                      {
                        "opacity-0": hideInput,
                        "pl-2": !showTag,
                        "pl-[calc(var(--tag-width)+8px)]": showTag
                      }
                    ),
                    placeholder: hidePlaceholder ? void 0 : placeholder,
                    ...inputProps
                  }
                )
              ] }),
              allowClear && controlledValue && /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: (e) => {
                    e.preventDefault();
                    handleValueChange(void 0);
                  },
                  className: "bg-ui-bg-base hover:bg-ui-bg-base-hover txt-compact-small-plus text-ui-fg-subtle focus-within:border-ui-fg-interactive transition-fg absolute right-[28px] top-0.5 z-[1] flex h-[28px] items-center rounded-[4px] border px-1.5 py-[2px] outline-none",
                  children: /* @__PURE__ */ jsx(XMarkMini, { className: "text-ui-fg-muted" })
                }
              ),
              /* @__PURE__ */ jsx(
                PrimitiveComboboxDisclosure,
                {
                  render: (props) => {
                    return /* @__PURE__ */ jsx(
                      "button",
                      {
                        ...props,
                        type: "button",
                        className: "text-ui-fg-muted transition-fg hover:bg-ui-bg-field-hover absolute right-0 flex size-8 items-center justify-center rounded-r outline-none",
                        children: /* @__PURE__ */ jsx(TrianglesMini, {})
                      }
                    );
                  }
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          PrimitiveComboboxPopover,
          {
            gutter: 4,
            sameWidth: true,
            ref: listboxRef,
            role: "listbox",
            className: clx(
              "shadow-elevation-flyout bg-ui-bg-base z-50 rounded-[8px] p-1",
              "max-h-[200px] overflow-y-auto",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            ),
            style: {
              pointerEvents: open ? "auto" : "none"
            },
            "aria-busy": isPending,
            children: [
              results.map(({ value, label, disabled }) => /* @__PURE__ */ jsxs(
                PrimitiveComboboxItem,
                {
                  value,
                  focusOnHover: true,
                  setValueOnClick: false,
                  disabled,
                  className: clx(
                    "transition-fg bg-ui-bg-base data-[active-item=true]:bg-ui-bg-base-hover group flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1",
                    {
                      "text-ui-fg-disabled": disabled,
                      "bg-ui-bg-component": disabled
                    }
                  ),
                  children: [
                    /* @__PURE__ */ jsx(PrimitiveComboboxItemCheck, { className: "flex !size-5 items-center justify-center", children: isArrayValue ? /* @__PURE__ */ jsx(CheckMini, {}) : /* @__PURE__ */ jsx(EllipseMiniSolid, {}) }),
                    /* @__PURE__ */ jsx(PrimitiveComboboxItemValue, { className: "txt-compact-small", children: label })
                  ]
                },
                value
              )),
              !!fetchNextPage && /* @__PURE__ */ jsx("div", { ref: lastOptionRef, className: "w-px" }),
              isFetchingNextPage && /* @__PURE__ */ jsx("div", { className: "transition-fg bg-ui-bg-base flex items-center rounded-[4px] px-2 py-1.5", children: /* @__PURE__ */ jsx("div", { className: "bg-ui-bg-component size-full h-5 w-full animate-pulse rounded-[4px]" }) }),
              !results.length && (noResultsPlaceholder && !searchValue?.length ? noResultsPlaceholder : /* @__PURE__ */ jsx("div", { className: "flex items-center gap-x-2 rounded-[4px] px-2 py-1.5", children: /* @__PURE__ */ jsx(
                Text,
                {
                  size: "small",
                  leading: "compact",
                  className: "text-ui-fg-subtle",
                  children: t("general.noResultsTitle")
                }
              ) })),
              !results.length && onCreateOption && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(PrimitiveSeparator, { className: "bg-ui-border-base -mx-1" }),
                /* @__PURE__ */ jsxs(
                  PrimitiveComboboxItem,
                  {
                    value: uncontrolledSearchValue,
                    focusOnHover: true,
                    setValueOnClick: false,
                    className: "transition-fg bg-ui-bg-base data-[active-item=true]:bg-ui-bg-base-hover group mt-1 flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1.5",
                    children: [
                      /* @__PURE__ */ jsx(PlusMini, { className: "text-ui-fg-subtle" }),
                      /* @__PURE__ */ jsxs(Text, { size: "small", leading: "compact", children: [
                        t("actions.create"),
                        ' "',
                        searchValue,
                        '"'
                      ] })
                    ]
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
};
var Combobox = genericForwardRef(ComboboxImpl);

export {
  Combobox
};
