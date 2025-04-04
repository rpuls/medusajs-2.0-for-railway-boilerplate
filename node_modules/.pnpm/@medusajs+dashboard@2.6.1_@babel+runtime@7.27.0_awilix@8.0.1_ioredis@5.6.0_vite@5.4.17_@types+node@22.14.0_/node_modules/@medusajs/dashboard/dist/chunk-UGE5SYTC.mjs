import {
  currencies,
  getCurrencySymbol
} from "./chunk-MWVM4TYO.mjs";
import {
  useStore
} from "./chunk-23LLRBGF.mjs";
import {
  Form
} from "./chunk-WAYDNCEG.mjs";

// src/routes/campaigns/common/components/create-campaign-form-fields/create-campaign-form-fields.tsx
import {
  CurrencyInput,
  DatePicker,
  Heading,
  Input,
  RadioGroup,
  Select,
  Text,
  Textarea
} from "@medusajs/ui";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var CreateCampaignFormFields = ({ form, fieldScope = "" }) => {
  const { t } = useTranslation();
  const { store } = useStore();
  const watchValueType = useWatch({
    control: form.control,
    name: `${fieldScope}budget.type`
  });
  const isTypeSpend = watchValueType === "spend";
  const currencyValue = useWatch({
    control: form.control,
    name: `${fieldScope}budget.currency_code`
  });
  const promotionCurrencyValue = useWatch({
    control: form.control,
    name: `application_method.currency_code`
  });
  const currency = currencyValue || promotionCurrencyValue;
  useEffect(() => {
    form.setValue(`${fieldScope}budget.limit`, null);
    if (isTypeSpend) {
      form.setValue(`campaign.budget.currency_code`, promotionCurrencyValue);
    }
    if (watchValueType === "usage") {
      form.setValue(`campaign.budget.currency_code`, null);
    }
  }, [watchValueType]);
  if (promotionCurrencyValue) {
    const formCampaignBudget = form.getValues().campaign?.budget;
    const formCampaignCurrency = formCampaignBudget?.currency_code;
    if (formCampaignBudget?.type === "spend" && formCampaignCurrency !== promotionCurrencyValue) {
      form.setValue("campaign.budget.currency_code", promotionCurrencyValue);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex w-full max-w-[720px] flex-col gap-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Heading, { children: t("campaigns.create.header") }),
      /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: t("campaigns.create.hint") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsx(
          Form.Field,
          {
            control: form.control,
            name: `${fieldScope}name`,
            render: ({ field }) => {
              return /* @__PURE__ */ jsxs(Form.Item, { children: [
                /* @__PURE__ */ jsx(Form.Label, { children: t("fields.name") }),
                /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(Input, { ...field }) }),
                /* @__PURE__ */ jsx(Form.ErrorMessage, {})
              ] });
            }
          }
        ),
        /* @__PURE__ */ jsx(
          Form.Field,
          {
            control: form.control,
            name: `${fieldScope}campaign_identifier`,
            render: ({ field }) => {
              return /* @__PURE__ */ jsxs(Form.Item, { children: [
                /* @__PURE__ */ jsx(Form.Label, { children: t("campaigns.fields.identifier") }),
                /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(Input, { ...field }) }),
                /* @__PURE__ */ jsx(Form.ErrorMessage, {})
              ] });
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Form.Field,
        {
          control: form.control,
          name: `${fieldScope}description`,
          render: ({ field }) => {
            return /* @__PURE__ */ jsxs(Form.Item, { children: [
              /* @__PURE__ */ jsx(Form.Label, { optional: true, children: t("fields.description") }),
              /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(Textarea, { ...field }) }),
              /* @__PURE__ */ jsx(Form.ErrorMessage, {})
            ] });
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        Form.Field,
        {
          control: form.control,
          name: `${fieldScope}starts_at`,
          render: ({ field }) => {
            return /* @__PURE__ */ jsxs(Form.Item, { children: [
              /* @__PURE__ */ jsx(Form.Label, { optional: true, children: t("campaigns.fields.start_date") }),
              /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
                DatePicker,
                {
                  granularity: "minute",
                  shouldCloseOnSelect: false,
                  ...field
                }
              ) }),
              /* @__PURE__ */ jsx(Form.ErrorMessage, {})
            ] });
          }
        }
      ),
      /* @__PURE__ */ jsx(
        Form.Field,
        {
          control: form.control,
          name: `${fieldScope}ends_at`,
          render: ({ field }) => {
            return /* @__PURE__ */ jsxs(Form.Item, { children: [
              /* @__PURE__ */ jsx(Form.Label, { optional: true, children: t("campaigns.fields.end_date") }),
              /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
                DatePicker,
                {
                  granularity: "minute",
                  shouldCloseOnSelect: false,
                  ...field
                }
              ) }),
              /* @__PURE__ */ jsx(Form.ErrorMessage, {})
            ] });
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Heading, { children: t("campaigns.budget.create.header") }),
      /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: t("campaigns.budget.create.hint") })
    ] }),
    /* @__PURE__ */ jsx(
      Form.Field,
      {
        control: form.control,
        name: `${fieldScope}budget.type`,
        render: ({ field }) => {
          return /* @__PURE__ */ jsxs(Form.Item, { children: [
            /* @__PURE__ */ jsx(
              Form.Label,
              {
                tooltip: fieldScope?.length && !currency ? t("promotions.tooltips.campaignType") : void 0,
                children: t("campaigns.budget.fields.type")
              }
            ),
            /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsxs(
              RadioGroup,
              {
                className: "flex gap-y-3",
                ...field,
                onValueChange: field.onChange,
                children: [
                  /* @__PURE__ */ jsx(
                    RadioGroup.ChoiceBox,
                    {
                      value: "usage",
                      label: t("campaigns.budget.type.usage.title"),
                      description: t("campaigns.budget.type.usage.description")
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    RadioGroup.ChoiceBox,
                    {
                      value: "spend",
                      label: t("campaigns.budget.type.spend.title"),
                      description: t("campaigns.budget.type.spend.description"),
                      disabled: fieldScope?.length ? !currency : false
                    }
                  )
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(Form.ErrorMessage, {})
          ] });
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
      isTypeSpend && /* @__PURE__ */ jsx(
        Form.Field,
        {
          control: form.control,
          name: `${fieldScope}budget.currency_code`,
          render: ({ field: { onChange, ref, ...field } }) => {
            return /* @__PURE__ */ jsxs(Form.Item, { children: [
              /* @__PURE__ */ jsx(
                Form.Label,
                {
                  tooltip: fieldScope?.length && !currency ? t("promotions.campaign_currency.tooltip") : void 0,
                  children: t("fields.currency")
                }
              ),
              /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsxs(
                Select,
                {
                  ...field,
                  onValueChange: onChange,
                  disabled: !!fieldScope.length,
                  children: [
                    /* @__PURE__ */ jsx(Select.Trigger, { ref, children: /* @__PURE__ */ jsx(Select.Value, {}) }),
                    /* @__PURE__ */ jsx(Select.Content, { children: Object.values(currencies).filter(
                      (currency2) => !!store?.supported_currencies?.find(
                        (c) => c.currency_code === currency2.code.toLocaleLowerCase()
                      )
                    ).map((currency2) => /* @__PURE__ */ jsx(
                      Select.Item,
                      {
                        value: currency2.code.toLowerCase(),
                        children: currency2.name
                      },
                      currency2.code
                    )) })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(Form.ErrorMessage, {})
            ] });
          }
        }
      ),
      /* @__PURE__ */ jsx(
        Form.Field,
        {
          control: form.control,
          name: `${fieldScope}budget.limit`,
          render: ({ field: { onChange, value, ...field } }) => {
            return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
              /* @__PURE__ */ jsx(
                Form.Label,
                {
                  tooltip: !currency && isTypeSpend ? t("promotions.fields.amount.tooltip") : void 0,
                  children: t("campaigns.budget.fields.limit")
                }
              ),
              /* @__PURE__ */ jsx(Form.Control, { children: isTypeSpend ? /* @__PURE__ */ jsx(
                CurrencyInput,
                {
                  min: 0,
                  onValueChange: (value2) => onChange(value2 ? parseInt(value2) : ""),
                  code: currencyValue,
                  symbol: currencyValue ? getCurrencySymbol(currencyValue) : "",
                  ...field,
                  value,
                  disabled: !currency && isTypeSpend
                }
              ) : /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  ...field,
                  min: 0,
                  value,
                  onChange: (e) => {
                    onChange(
                      e.target.value === "" ? null : parseInt(e.target.value)
                    );
                  }
                },
                "usage"
              ) }),
              /* @__PURE__ */ jsx(Form.ErrorMessage, {})
            ] });
          }
        }
      )
    ] })
  ] });
};

export {
  CreateCampaignFormFields
};
