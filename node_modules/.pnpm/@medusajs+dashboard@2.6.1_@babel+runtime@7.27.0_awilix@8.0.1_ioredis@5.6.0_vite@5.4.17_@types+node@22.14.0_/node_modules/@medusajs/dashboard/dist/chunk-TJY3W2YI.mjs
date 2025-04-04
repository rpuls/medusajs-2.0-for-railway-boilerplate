import {
  CreateCampaignFormFields
} from "./chunk-UGE5SYTC.mjs";
import {
  useUpdatePromotion
} from "./chunk-SWYL3QGB.mjs";
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

// src/routes/promotions/promotion-add-campaign/components/add-campaign-promotion-form/add-campaign-promotion-form.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, RadioGroup, Select, Text as Text2, toast } from "@medusajs/ui";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Trans, useTranslation as useTranslation2 } from "react-i18next";
import * as zod from "zod";

// src/routes/promotions/promotion-add-campaign/components/add-campaign-promotion-form/campaign-details.tsx
import { Heading, Text } from "@medusajs/ui";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var CampaignDetails = ({ campaign }) => {
  const { t } = useTranslation();
  if (!campaign) {
    return;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Heading, { level: "h2", className: "mb-4", children: t("campaigns.details") }),
      /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-center py-1", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-small-plus font-", children: t("campaigns.fields.identifier") }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(Text, { className: "txt-small", children: campaign.campaign_identifier || "-" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-center py-1", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-small-plus", children: t("fields.description") }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(Text, { className: "txt-small", children: campaign.description || "-" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-center py-1", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-small-plus", children: t("campaigns.fields.start_date") }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(Text, { className: "txt-small", children: campaign.starts_at?.toString() || "-" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-center py-1", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-small-plus", children: t("campaigns.fields.end_date") }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(Text, { className: "txt-small", children: campaign.ends_at?.toString() || "-" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Heading, { level: "h2", className: "mb-4", children: t("campaigns.budget.details") }),
      /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-center py-1", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-small-plus font-", children: t("campaigns.budget.fields.type") }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(Text, { className: "txt-small", children: campaign.budget?.type || "-" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-center py-1", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-small-plus", children: t("campaigns.budget.fields.currency") }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(Text, { className: "txt-small", children: campaign?.budget?.currency_code || "-" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-center py-1", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-small-plus", children: t("campaigns.budget.fields.limit") }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(Text, { className: "txt-small", children: campaign.budget?.limit || "-" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-center py-1", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-small-plus", children: t("campaigns.budget.fields.used") }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(Text, { className: "txt-small", children: campaign.budget?.used || "-" }) })
      ] })
    ] })
  ] });
};

// src/routes/promotions/promotion-add-campaign/components/add-campaign-promotion-form/add-campaign-promotion-form.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var EditPromotionSchema = zod.object({
  campaign_id: zod.string().optional().nullable(),
  campaign_choice: zod.enum(["none", "existing"]).optional()
});
var AddCampaignPromotionFields = ({
  form,
  campaigns,
  withNewCampaign = true
}) => {
  const { t } = useTranslation2();
  const watchCampaignId = useWatch({
    control: form.control,
    name: "campaign_id"
  });
  const watchCampaignChoice = useWatch({
    control: form.control,
    name: "campaign_choice"
  });
  const selectedCampaign = campaigns.find((c) => c.id === watchCampaignId);
  return /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-y-8", children: [
    /* @__PURE__ */ jsx2(
      Form.Field,
      {
        control: form.control,
        name: "campaign_choice",
        render: ({ field }) => {
          return /* @__PURE__ */ jsxs2(Form.Item, { children: [
            /* @__PURE__ */ jsx2(Form.Label, { children: t("promotions.fields.campaign") }),
            /* @__PURE__ */ jsx2(Form.Control, { children: /* @__PURE__ */ jsxs2(
              RadioGroup,
              {
                className: "grid grid-cols-1 gap-3",
                ...field,
                value: field.value,
                onValueChange: field.onChange,
                children: [
                  /* @__PURE__ */ jsx2(
                    RadioGroup.ChoiceBox,
                    {
                      value: "none",
                      label: t("promotions.form.campaign.none.title"),
                      description: t("promotions.form.campaign.none.description")
                    }
                  ),
                  /* @__PURE__ */ jsx2(
                    RadioGroup.ChoiceBox,
                    {
                      value: "existing",
                      label: t("promotions.form.campaign.existing.title"),
                      description: t(
                        "promotions.form.campaign.existing.description"
                      )
                    }
                  ),
                  withNewCampaign && /* @__PURE__ */ jsx2(
                    RadioGroup.ChoiceBox,
                    {
                      value: "new",
                      label: t("promotions.form.campaign.new.title"),
                      description: t(
                        "promotions.form.campaign.new.description"
                      )
                    }
                  )
                ]
              }
            ) }),
            /* @__PURE__ */ jsx2(Form.ErrorMessage, {})
          ] });
        }
      }
    ),
    watchCampaignChoice === "existing" && /* @__PURE__ */ jsx2(
      Form.Field,
      {
        control: form.control,
        name: "campaign_id",
        render: ({ field: { onChange, ref, ...field } }) => {
          return /* @__PURE__ */ jsxs2(Form.Item, { children: [
            /* @__PURE__ */ jsx2(Form.Label, { children: t("promotions.form.campaign.existing.title") }),
            /* @__PURE__ */ jsx2(Form.Control, { children: /* @__PURE__ */ jsxs2(Select, { onValueChange: onChange, ...field, children: [
              /* @__PURE__ */ jsx2(Select.Trigger, { ref, children: /* @__PURE__ */ jsx2(Select.Value, {}) }),
              /* @__PURE__ */ jsxs2(Select.Content, { children: [
                !campaigns.length && /* @__PURE__ */ jsxs2("div", { className: "flex h-[120px] flex-col items-center justify-center gap-2 p-2", children: [
                  /* @__PURE__ */ jsx2("span", { className: "txt-small text-ui-fg-subtle font-medium", children: t(
                    "promotions.form.campaign.existing.placeholder.title"
                  ) }),
                  /* @__PURE__ */ jsx2("span", { className: "txt-small text-ui-fg-muted", children: t(
                    "promotions.form.campaign.existing.placeholder.desc"
                  ) })
                ] }),
                campaigns.map((c) => /* @__PURE__ */ jsx2(Select.Item, { value: c.id, children: c.name?.toUpperCase() }, c.id))
              ] })
            ] }) }),
            /* @__PURE__ */ jsx2(
              Text2,
              {
                size: "small",
                leading: "compact",
                className: "text-ui-fg-subtle",
                children: /* @__PURE__ */ jsx2(
                  Trans,
                  {
                    t,
                    i18nKey: "campaigns.fields.campaign_id.hint",
                    components: [/* @__PURE__ */ jsx2("br", {}, "break")]
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx2(Form.ErrorMessage, {})
          ] });
        }
      }
    ),
    watchCampaignChoice === "new" && /* @__PURE__ */ jsx2(CreateCampaignFormFields, { form, fieldScope: "campaign." }),
    /* @__PURE__ */ jsx2(CampaignDetails, { campaign: selectedCampaign })
  ] });
};
var AddCampaignPromotionForm = ({
  promotion,
  campaigns
}) => {
  const { t } = useTranslation2();
  const { handleSuccess } = useRouteModal();
  const { campaign } = promotion;
  const originalId = campaign?.id;
  const form = useForm({
    defaultValues: {
      campaign_id: campaign?.id,
      campaign_choice: campaign?.id ? "existing" : "none"
    },
    resolver: zodResolver(EditPromotionSchema)
  });
  const { setValue } = form;
  const { mutateAsync, isPending } = useUpdatePromotion(promotion.id);
  const handleSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      { campaign_id: data.campaign_id },
      {
        onSuccess: () => {
          toast.success(t("promotions.campaign.edit.successToast"));
          handleSuccess();
        },
        onError: (e) => {
          toast.error(e.message);
        }
      }
    );
  });
  const watchCampaignChoice = useWatch({
    control: form.control,
    name: "campaign_choice"
  });
  useEffect(() => {
    if (watchCampaignChoice === "none") {
      setValue("campaign_id", null);
    }
    if (watchCampaignChoice === "existing") {
      setValue("campaign_id", originalId);
    }
  }, [watchCampaignChoice, setValue, originalId]);
  return /* @__PURE__ */ jsx2(RouteDrawer.Form, { form, children: /* @__PURE__ */ jsxs2(
    KeyboundForm,
    {
      onSubmit: handleSubmit,
      className: "flex size-full flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsx2(RouteDrawer.Body, { className: "size-full overflow-auto", children: /* @__PURE__ */ jsx2(
          AddCampaignPromotionFields,
          {
            form,
            campaigns,
            withNewCampaign: false
          }
        ) }),
        /* @__PURE__ */ jsx2(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-end gap-x-2", children: [
          /* @__PURE__ */ jsx2(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsx2(Button, { size: "small", variant: "secondary", children: t("actions.cancel") }) }),
          /* @__PURE__ */ jsx2(Button, { size: "small", type: "submit", isLoading: isPending, children: t("actions.save") })
        ] }) })
      ]
    }
  ) });
};

export {
  AddCampaignPromotionFields,
  AddCampaignPromotionForm
};
