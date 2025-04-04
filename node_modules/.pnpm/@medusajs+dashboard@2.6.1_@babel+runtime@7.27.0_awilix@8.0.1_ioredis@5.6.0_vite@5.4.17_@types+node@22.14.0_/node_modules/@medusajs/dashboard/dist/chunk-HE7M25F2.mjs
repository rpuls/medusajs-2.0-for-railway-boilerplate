import {
  Skeleton
} from "./chunk-LPEUYMRK.mjs";
import {
  ConditionalTooltip
} from "./chunk-OC7BQLYI.mjs";
import {
  KeyboundForm
} from "./chunk-6HTZNHPT.mjs";
import {
  RouteDrawer,
  useRouteModal
} from "./chunk-JGQGO74V.mjs";
import {
  Form
} from "./chunk-WAYDNCEG.mjs";

// src/components/forms/metadata-form/metadata-form.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  DropdownMenu,
  Heading,
  IconButton,
  InlineTip,
  clx,
  toast
} from "@medusajs/ui";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  ArrowDownMini,
  ArrowUpMini,
  EllipsisVertical,
  Trash
} from "@medusajs/icons";
import { forwardRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var MetadataFieldSchema = z.object({
  key: z.string(),
  disabled: z.boolean().optional(),
  value: z.any()
});
var MetadataSchema = z.object({
  metadata: z.array(MetadataFieldSchema)
});
var MetadataForm = (props) => {
  const { t } = useTranslation();
  const { isPending, ...innerProps } = props;
  return /* @__PURE__ */ jsxs(RouteDrawer, { children: [
    /* @__PURE__ */ jsxs(RouteDrawer.Header, { children: [
      /* @__PURE__ */ jsx(RouteDrawer.Title, { asChild: true, children: /* @__PURE__ */ jsx(Heading, { children: t("metadata.edit.header") }) }),
      /* @__PURE__ */ jsx(RouteDrawer.Description, { className: "sr-only", children: t("metadata.edit.description") })
    ] }),
    isPending ? /* @__PURE__ */ jsx(PlaceholderInner, {}) : /* @__PURE__ */ jsx(InnerForm, { ...innerProps })
  ] });
};
var METADATA_KEY_LABEL_ID = "metadata-form-key-label";
var METADATA_VALUE_LABEL_ID = "metadata-form-value-label";
var InnerForm = ({
  metadata,
  hook,
  isMutating
}) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const hasUneditableRows = getHasUneditableRows(metadata);
  const form = useForm({
    defaultValues: {
      metadata: getDefaultValues(metadata)
    },
    resolver: zodResolver(MetadataSchema)
  });
  const handleSubmit = form.handleSubmit(async (data) => {
    const parsedData = parseValues(data, metadata);
    await hook(
      {
        metadata: parsedData
      },
      {
        onSuccess: () => {
          toast.success(t("metadata.edit.successToast"));
          handleSuccess();
        },
        onError: (error) => {
          toast.error(error.message);
        }
      }
    );
  });
  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: "metadata"
  });
  function deleteRow(index) {
    remove(index);
    if (fields.length === 1) {
      insert(0, {
        key: "",
        value: "",
        disabled: false
      });
    }
  }
  function insertRow(index, position) {
    insert(index + (position === "above" ? 0 : 1), {
      key: "",
      value: "",
      disabled: false
    });
  }
  return /* @__PURE__ */ jsx(RouteDrawer.Form, { form, children: /* @__PURE__ */ jsxs(
    KeyboundForm,
    {
      onSubmit: handleSubmit,
      className: "flex flex-1 flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsxs(RouteDrawer.Body, { className: "flex flex-1 flex-col gap-y-8 overflow-y-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-ui-bg-base shadow-elevation-card-rest grid grid-cols-1 divide-y rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-ui-bg-subtle grid grid-cols-2 divide-x rounded-t-lg", children: [
              /* @__PURE__ */ jsx("div", { className: "txt-compact-small-plus text-ui-fg-subtle px-2 py-1.5", children: /* @__PURE__ */ jsx("label", { id: METADATA_KEY_LABEL_ID, children: t("metadata.edit.labels.key") }) }),
              /* @__PURE__ */ jsx("div", { className: "txt-compact-small-plus text-ui-fg-subtle px-2 py-1.5", children: /* @__PURE__ */ jsx("label", { id: METADATA_VALUE_LABEL_ID, children: t("metadata.edit.labels.value") }) })
            ] }),
            fields.map((field, index) => {
              const isDisabled = field.disabled || false;
              let placeholder = "-";
              if (typeof field.value === "object") {
                placeholder = "{ ... }";
              }
              if (Array.isArray(field.value)) {
                placeholder = "[ ... ]";
              }
              return /* @__PURE__ */ jsx(
                ConditionalTooltip,
                {
                  showTooltip: isDisabled,
                  content: t("metadata.edit.complexRow.tooltip"),
                  children: /* @__PURE__ */ jsxs("div", { className: "group/table relative", children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: clx("grid grid-cols-2 divide-x", {
                          "overflow-hidden rounded-b-lg": index === fields.length - 1
                        }),
                        children: [
                          /* @__PURE__ */ jsx(
                            Form.Field,
                            {
                              control: form.control,
                              name: `metadata.${index}.key`,
                              render: ({ field: field2 }) => {
                                return /* @__PURE__ */ jsx(Form.Item, { children: /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
                                  GridInput,
                                  {
                                    "aria-labelledby": METADATA_KEY_LABEL_ID,
                                    ...field2,
                                    disabled: isDisabled,
                                    placeholder: "Key"
                                  }
                                ) }) });
                              }
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Form.Field,
                            {
                              control: form.control,
                              name: `metadata.${index}.value`,
                              render: ({ field: { value, ...field2 } }) => {
                                return /* @__PURE__ */ jsx(Form.Item, { children: /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
                                  GridInput,
                                  {
                                    "aria-labelledby": METADATA_VALUE_LABEL_ID,
                                    ...field2,
                                    value: isDisabled ? placeholder : value,
                                    disabled: isDisabled,
                                    placeholder: "Value"
                                  }
                                ) }) });
                              }
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                      /* @__PURE__ */ jsx(
                        DropdownMenu.Trigger,
                        {
                          className: clx(
                            "invisible absolute inset-y-0 -right-2.5 my-auto group-hover/table:visible data-[state='open']:visible",
                            {
                              hidden: isDisabled
                            }
                          ),
                          disabled: isDisabled,
                          asChild: true,
                          children: /* @__PURE__ */ jsx(IconButton, { size: "2xsmall", children: /* @__PURE__ */ jsx(EllipsisVertical, {}) })
                        }
                      ),
                      /* @__PURE__ */ jsxs(DropdownMenu.Content, { children: [
                        /* @__PURE__ */ jsxs(
                          DropdownMenu.Item,
                          {
                            className: "gap-x-2",
                            onClick: () => insertRow(index, "above"),
                            children: [
                              /* @__PURE__ */ jsx(ArrowUpMini, { className: "text-ui-fg-subtle" }),
                              t("metadata.edit.actions.insertRowAbove")
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxs(
                          DropdownMenu.Item,
                          {
                            className: "gap-x-2",
                            onClick: () => insertRow(index, "below"),
                            children: [
                              /* @__PURE__ */ jsx(ArrowDownMini, { className: "text-ui-fg-subtle" }),
                              t("metadata.edit.actions.insertRowBelow")
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsx(DropdownMenu.Separator, {}),
                        /* @__PURE__ */ jsxs(
                          DropdownMenu.Item,
                          {
                            className: "gap-x-2",
                            onClick: () => deleteRow(index),
                            children: [
                              /* @__PURE__ */ jsx(Trash, { className: "text-ui-fg-subtle" }),
                              t("metadata.edit.actions.deleteRow")
                            ]
                          }
                        )
                      ] })
                    ] })
                  ] })
                },
                field.id
              );
            })
          ] }),
          hasUneditableRows && /* @__PURE__ */ jsx(
            InlineTip,
            {
              variant: "warning",
              label: t("metadata.edit.complexRow.label"),
              children: t("metadata.edit.complexRow.description")
            }
          )
        ] }),
        /* @__PURE__ */ jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
          /* @__PURE__ */ jsx(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsx(
            Button,
            {
              size: "small",
              variant: "secondary",
              type: "button",
              disabled: isMutating,
              children: t("actions.cancel")
            }
          ) }),
          /* @__PURE__ */ jsx(Button, { size: "small", type: "submit", isLoading: isMutating, children: t("actions.save") })
        ] }) })
      ]
    }
  ) });
};
var GridInput = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "input",
    {
      ref,
      ...props,
      autoComplete: "off",
      className: clx(
        "txt-compact-small text-ui-fg-base placeholder:text-ui-fg-muted disabled:text-ui-fg-disabled disabled:bg-ui-bg-base bg-transparent px-2 py-1.5 outline-none",
        className
      )
    }
  );
});
GridInput.displayName = "MetadataForm.GridInput";
var PlaceholderInner = () => {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsx(RouteDrawer.Body, { children: /* @__PURE__ */ jsx(Skeleton, { className: "h-[148ox] w-full rounded-lg" }) }),
    /* @__PURE__ */ jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-12 rounded-md" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-12 rounded-md" })
    ] }) })
  ] });
};
var EDITABLE_TYPES = ["string", "number", "boolean"];
function getDefaultValues(metadata) {
  if (!metadata || !Object.keys(metadata).length) {
    return [
      {
        key: "",
        value: "",
        disabled: false
      }
    ];
  }
  return Object.entries(metadata).map(([key, value]) => {
    if (!EDITABLE_TYPES.includes(typeof value)) {
      return {
        key,
        value,
        disabled: true
      };
    }
    let stringValue = value;
    if (typeof value !== "string") {
      stringValue = JSON.stringify(value);
    }
    return {
      key,
      value: stringValue,
      original_key: key
    };
  });
}
function parseValues(values, original) {
  const metadata = values.metadata;
  const isEmpty = !metadata.length || metadata.length === 1 && !metadata[0].key && !metadata[0].value;
  if (isEmpty) {
    return null;
  }
  const update = {};
  if (original) {
    Object.keys(original).forEach((originalKey) => {
      const exists = metadata.some((field) => field.key === originalKey);
      if (!exists) {
        update[originalKey] = "";
      }
    });
  }
  metadata.forEach((field) => {
    let key = field.key;
    let value = field.value;
    const disabled = field.disabled;
    if (!key) {
      return;
    }
    if (disabled) {
      update[key] = value;
      return;
    }
    key = key.trim();
    value = value?.trim() ?? "";
    if (value === "true") {
      update[key] = true;
    } else if (value === "false") {
      update[key] = false;
    } else {
      const isNumeric = /^-?\d*\.?\d+$/.test(value);
      if (isNumeric) {
        update[key] = parseFloat(value);
      } else {
        update[key] = value;
      }
    }
  });
  return update;
}
function getHasUneditableRows(metadata) {
  if (!metadata) {
    return false;
  }
  return Object.values(metadata).some(
    (value) => !EDITABLE_TYPES.includes(typeof value)
  );
}

export {
  MetadataForm
};
