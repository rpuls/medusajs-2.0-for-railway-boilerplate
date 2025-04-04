import {
  Combobox
} from "./chunk-3LLQ6F7F.mjs";
import {
  usePromotionRuleAttributes,
  usePromotionRuleValues,
  usePromotionRules
} from "./chunk-SWYL3QGB.mjs";
import {
  useStore
} from "./chunk-23LLRBGF.mjs";
import {
  Form
} from "./chunk-WAYDNCEG.mjs";

// src/routes/promotions/common/edit-rules/components/rules-form-field/rules-form-field.tsx
import { XMarkMini } from "@medusajs/icons";
import { Badge, Button, Heading, IconButton, Select as Select2, Text } from "@medusajs/ui";
import { forwardRef, Fragment, useEffect } from "react";
import {
  useFieldArray,
  useWatch as useWatch2
} from "react-hook-form";
import { useTranslation } from "react-i18next";

// src/routes/promotions/common/edit-rules/components/edit-rules-form/utils.ts
var generateRuleAttributes = (rules) => (rules || []).map((rule) => ({
  id: rule.id,
  required: rule.required,
  field_type: rule.field_type,
  disguised: rule.disguised,
  attribute: rule.attribute,
  operator: rule.operator,
  values: rule.field_type === "number" || rule.operator === "eq" ? typeof rule.values === "object" ? rule.values[0]?.value : rule.values : rule?.values?.map((v) => v.value)
}));

// src/routes/promotions/common/edit-rules/components/rule-value-form-field/rule-value-form-field.tsx
import { Input, Select } from "@medusajs/ui";
import { useWatch } from "react-hook-form";
import { jsx, jsxs } from "react/jsx-runtime";
var buildFilters = (attribute, store) => {
  if (!attribute || !store) {
    return {};
  }
  if (attribute === "currency_code") {
    return {
      value: store.supported_currencies?.map((c) => c.currency_code)
    };
  }
  return {};
};
var RuleValueFormField = ({
  form,
  identifier,
  scope,
  name,
  operator,
  fieldRule,
  attributes,
  ruleType
}) => {
  const attribute = attributes?.find(
    (attr) => attr.value === fieldRule.attribute
  );
  const { store, isLoading: isStoreLoading } = useStore();
  const { values: options = [] } = usePromotionRuleValues(
    ruleType,
    attribute?.id,
    buildFilters(attribute?.id, store),
    {
      enabled: !!attribute?.id && ["select", "multiselect"].includes(attribute.field_type) && !isStoreLoading
    }
  );
  const watchOperator = useWatch({
    control: form.control,
    name: operator
  });
  return /* @__PURE__ */ jsx(
    Form.Field,
    {
      name,
      render: ({ field: { onChange, ref, ...field } }) => {
        if (attribute?.field_type === "number") {
          return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
            /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
              Input,
              {
                ...field,
                type: "number",
                onChange,
                className: "bg-ui-bg-base",
                ref,
                min: 1,
                disabled: !fieldRule.attribute
              }
            ) }),
            /* @__PURE__ */ jsx(Form.ErrorMessage, {})
          ] });
        } else if (attribute?.field_type === "text") {
          return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
            /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
              Input,
              {
                ...field,
                ref,
                onChange,
                className: "bg-ui-bg-base",
                disabled: !fieldRule.attribute
              }
            ) }),
            /* @__PURE__ */ jsx(Form.ErrorMessage, {})
          ] });
        } else if (watchOperator === "eq") {
          return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
            /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsxs(
              Select,
              {
                ...field,
                value: Array.isArray(field.value) ? field.value[0] : field.value,
                onValueChange: onChange,
                disabled: !fieldRule.attribute,
                children: [
                  /* @__PURE__ */ jsx(Select.Trigger, { ref, className: "bg-ui-bg-base", children: /* @__PURE__ */ jsx(Select.Value, { placeholder: "Select Value" }) }),
                  /* @__PURE__ */ jsx(Select.Content, { children: options?.map((option, i) => /* @__PURE__ */ jsx(
                    Select.Item,
                    {
                      value: option.value,
                      children: /* @__PURE__ */ jsx("span", { className: "text-ui-fg-subtle", children: option.label })
                    },
                    `${identifier}-value-option-${i}`
                  )) })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(Form.ErrorMessage, {})
          ] });
        } else {
          return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
            /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
              Combobox,
              {
                ...field,
                ref,
                placeholder: "Select Values",
                options,
                onChange,
                className: "bg-ui-bg-base",
                disabled: !fieldRule.attribute
              }
            ) }),
            /* @__PURE__ */ jsx(Form.ErrorMessage, {})
          ] });
        }
      }
    },
    `${identifier}.${scope}.${name}-${fieldRule.attribute}`
  );
};

// src/routes/promotions/common/edit-rules/components/rules-form-field/constants.ts
var requiredProductRule = {
  id: "product",
  attribute: "items.product.id",
  attribute_label: "Product",
  operator: "eq",
  operator_label: "Equal",
  values: [],
  required: true,
  field_type: "select",
  disguised: false
};

// src/routes/promotions/common/edit-rules/components/rules-form-field/rules-form-field.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var RulesFormField = ({
  form,
  ruleType,
  setRulesToRemove,
  rulesToRemove,
  scope = "rules",
  promotion
}) => {
  const { t } = useTranslation();
  const formData = form.getValues();
  const { attributes } = usePromotionRuleAttributes(ruleType, formData.type);
  const { fields, append, remove, update, replace } = useFieldArray({
    control: form.control,
    name: scope,
    keyName: scope
  });
  const promotionType = useWatch2({
    control: form.control,
    name: "type",
    defaultValue: promotion?.type
  });
  const applicationMethodType = useWatch2({
    control: form.control,
    name: "application_method.type",
    defaultValue: promotion?.application_method?.type
  });
  const query = promotionType ? {
    promotion_type: promotionType,
    application_method_type: applicationMethodType
  } : {};
  const { rules, isLoading } = usePromotionRules(
    promotion?.id || null,
    ruleType,
    query,
    {
      enabled: !!promotion?.id || !!promotionType && !!applicationMethodType
    }
  );
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (ruleType === "rules" && !fields.length) {
      form.resetField("rules");
      replace(generateRuleAttributes(rules));
    }
    if (ruleType === "buy-rules" && !fields.length) {
      form.resetField("application_method.buy_rules");
      const rulesToAppend = promotion?.id || promotionType === "standard" ? rules : [...rules, requiredProductRule];
      replace(generateRuleAttributes(rulesToAppend));
    }
    if (ruleType === "target-rules" && !fields.length) {
      form.resetField("application_method.target_rules");
      const rulesToAppend = promotion?.id || promotionType === "standard" ? rules : [...rules, requiredProductRule];
      replace(generateRuleAttributes(rulesToAppend));
    }
  }, [
    promotionType,
    isLoading,
    ruleType,
    fields.length,
    form,
    replace,
    rules,
    promotion?.id
  ]);
  return /* @__PURE__ */ jsxs2("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsx2(Heading, { level: "h2", className: "mb-2", children: t(`promotions.fields.conditions.${ruleType}.title`) }),
    /* @__PURE__ */ jsx2(Text, { className: "text-ui-fg-subtle txt-small mb-6", children: t(`promotions.fields.conditions.${ruleType}.description`) }),
    fields.map((fieldRule, index) => {
      const identifier = fieldRule.id;
      return /* @__PURE__ */ jsxs2(Fragment, { children: [
        /* @__PURE__ */ jsxs2("div", { className: "bg-ui-bg-subtle border-ui-border-base flex flex-row gap-2 rounded-xl border px-2 py-2", children: [
          /* @__PURE__ */ jsxs2("div", { className: "grow", children: [
            /* @__PURE__ */ jsx2(
              Form.Field,
              {
                name: `${scope}.${index}.attribute`,
                render: ({ field }) => {
                  const { onChange, ref, ...fieldProps } = field;
                  const existingAttributes = fields?.map((field2) => field2.attribute) || [];
                  const attributeOptions = attributes?.filter((attr) => {
                    if (attr.value === fieldRule.attribute) {
                      return true;
                    }
                    return !existingAttributes.includes(attr.value);
                  }) || [];
                  const disabled = !!fieldRule.required;
                  const onValueChange = (e) => {
                    const currentAttributeOption = attributeOptions.find(
                      (ao) => ao.id === e
                    );
                    update(index, {
                      ...fieldRule,
                      values: [],
                      disguised: currentAttributeOption?.disguised || false
                    });
                    onChange(e);
                  };
                  return /* @__PURE__ */ jsxs2(Form.Item, { className: "mb-2", children: [
                    fieldRule.required && /* @__PURE__ */ jsx2("div", { className: "flex items-center px-2", children: /* @__PURE__ */ jsx2("p", { className: "text text-ui-fg-muted txt-small", children: t("promotions.form.required") }) }),
                    /* @__PURE__ */ jsx2(Form.Control, { children: !disabled ? /* @__PURE__ */ jsxs2(
                      Select2,
                      {
                        ...fieldProps,
                        onValueChange,
                        disabled: fieldRule.required,
                        children: [
                          /* @__PURE__ */ jsx2(
                            Select2.Trigger,
                            {
                              ref,
                              className: "bg-ui-bg-base",
                              children: /* @__PURE__ */ jsx2(
                                Select2.Value,
                                {
                                  placeholder: t(
                                    "promotions.form.selectAttribute"
                                  )
                                }
                              )
                            }
                          ),
                          /* @__PURE__ */ jsx2(Select2.Content, { children: attributeOptions?.map((c, i) => /* @__PURE__ */ jsx2(
                            Select2.Item,
                            {
                              value: c.value,
                              children: /* @__PURE__ */ jsx2("span", { className: "text-ui-fg-subtle", children: c.label })
                            },
                            `${identifier}-attribute-option-${i}`
                          )) })
                        ]
                      }
                    ) : /* @__PURE__ */ jsx2(
                      DisabledField,
                      {
                        label: attributeOptions?.find(
                          (ao) => ao.value === fieldRule.attribute
                        )?.label || "",
                        field
                      }
                    ) }),
                    /* @__PURE__ */ jsx2(Form.ErrorMessage, {})
                  ] });
                }
              }
            ),
            /* @__PURE__ */ jsxs2("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx2(
                Form.Field,
                {
                  name: `${scope}.${index}.operator`,
                  render: ({ field }) => {
                    const { onChange, ref, ...fieldProps } = field;
                    const currentAttributeOption = attributes?.find(
                      (attr) => attr.value === fieldRule.attribute
                    );
                    const options = currentAttributeOption?.operators?.map((o, idx) => ({
                      label: o.label,
                      value: o.value,
                      key: `${identifier}-operator-option-${idx}`
                    })) || [];
                    const disabled = !!fieldRule.attribute && options?.length <= 1;
                    return /* @__PURE__ */ jsxs2(Form.Item, { className: "basis-1/2", children: [
                      /* @__PURE__ */ jsx2(Form.Control, { children: !disabled ? /* @__PURE__ */ jsxs2(
                        Select2,
                        {
                          ...fieldProps,
                          disabled: !fieldRule.attribute,
                          onValueChange: onChange,
                          children: [
                            /* @__PURE__ */ jsx2(
                              Select2.Trigger,
                              {
                                ref,
                                className: "bg-ui-bg-base",
                                children: /* @__PURE__ */ jsx2(Select2.Value, { placeholder: "Select Operator" })
                              }
                            ),
                            /* @__PURE__ */ jsx2(Select2.Content, { children: options?.map((c) => /* @__PURE__ */ jsx2(Select2.Item, { value: c.value, children: /* @__PURE__ */ jsx2("span", { className: "text-ui-fg-subtle", children: c.label }) }, c.key)) })
                          ]
                        }
                      ) : /* @__PURE__ */ jsx2(
                        DisabledField,
                        {
                          label: options.find(
                            (o) => o.value === fieldProps.value
                          )?.label || "",
                          field
                        }
                      ) }),
                      /* @__PURE__ */ jsx2(Form.ErrorMessage, {})
                    ] });
                  }
                }
              ),
              /* @__PURE__ */ jsx2(
                RuleValueFormField,
                {
                  form,
                  identifier,
                  scope,
                  name: `${scope}.${index}.values`,
                  operator: `${scope}.${index}.operator`,
                  fieldRule,
                  attributes,
                  ruleType
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx2("div", { className: "size-7 flex-none self-center", children: !fieldRule.required && /* @__PURE__ */ jsx2(
            IconButton,
            {
              size: "small",
              variant: "transparent",
              className: "text-ui-fg-muted",
              type: "button",
              onClick: () => {
                if (!fieldRule.required) {
                  setRulesToRemove && setRulesToRemove([...rulesToRemove, fieldRule]);
                  remove(index);
                }
              },
              children: /* @__PURE__ */ jsx2(XMarkMini, {})
            }
          ) })
        ] }),
        index < fields.length - 1 && /* @__PURE__ */ jsxs2("div", { className: "relative px-6 py-3", children: [
          /* @__PURE__ */ jsx2("div", { className: "border-ui-border-strong absolute bottom-0 left-[40px] top-0 z-[-1] w-px bg-[linear-gradient(var(--border-strong)_33%,rgba(255,255,255,0)_0%)] bg-[length:1px_3px] bg-repeat-y" }),
          /* @__PURE__ */ jsx2(Badge, { size: "2xsmall", className: " text-xs", children: t("promotions.form.and") })
        ] })
      ] }, `${fieldRule.id}.${index}.${fieldRule.attribute}`);
    }),
    /* @__PURE__ */ jsxs2("div", { className: fields.length ? "mt-6" : "", children: [
      /* @__PURE__ */ jsx2(
        Button,
        {
          type: "button",
          variant: "secondary",
          className: "inline-block",
          onClick: () => {
            append({
              attribute: "",
              operator: "",
              values: [],
              required: false
            });
          },
          children: t("promotions.fields.addCondition")
        }
      ),
      !!fields.length && /* @__PURE__ */ jsx2(
        Button,
        {
          type: "button",
          variant: "transparent",
          className: "text-ui-fg-muted hover:text-ui-fg-subtle ml-2 inline-block",
          onClick: () => {
            const indicesToRemove = fields.map((field, index) => field.required ? null : index).filter((f) => f !== null);
            setRulesToRemove && setRulesToRemove(fields.filter((field) => !field.required));
            remove(indicesToRemove);
          },
          children: t("promotions.fields.clearAll")
        }
      )
    ] })
  ] });
};
var DisabledField = forwardRef(
  ({ label, field }, ref) => {
    return /* @__PURE__ */ jsxs2("div", { children: [
      /* @__PURE__ */ jsx2("div", { className: "txt-compact-small bg-ui-bg-component shadow-borders-base text-ui-fg-base h-8 rounded-md px-2 py-1.5", children: label }),
      /* @__PURE__ */ jsx2("input", { ...field, ref, disabled: true, hidden: true })
    ] });
  }
);
DisabledField.displayName = "DisabledField";

export {
  RulesFormField
};
