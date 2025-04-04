import {
  CreateCampaignFormFields
} from "./chunk-UGE5SYTC.mjs";
import {
  VisuallyHidden
} from "./chunk-F6ZOHZVB.mjs";
import {
  useCreateCampaign
} from "./chunk-SWYL3QGB.mjs";
import {
  KeyboundForm
} from "./chunk-6HTZNHPT.mjs";
import {
  RouteFocusModal,
  useRouteModal
} from "./chunk-JGQGO74V.mjs";

// src/routes/campaigns/campaign-create/components/create-campaign-form/create-campaign-form.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, toast } from "@medusajs/ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as zod from "zod";

// src/routes/campaigns/common/constants.ts
var DEFAULT_CAMPAIGN_VALUES = {
  name: "",
  description: "",
  campaign_identifier: "",
  starts_at: null,
  ends_at: null,
  budget: {
    type: "usage",
    currency_code: null,
    limit: null
  }
};

// src/routes/campaigns/campaign-create/components/create-campaign-form/create-campaign-form.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var CreateCampaignSchema = zod.object({
  name: zod.string().min(1),
  description: zod.string().optional(),
  campaign_identifier: zod.string().min(1),
  starts_at: zod.date().nullable(),
  ends_at: zod.date().nullable(),
  budget: zod.object({
    limit: zod.number().min(0).nullish(),
    type: zod.enum(["spend", "usage"]),
    currency_code: zod.string().nullish()
  })
});
var CreateCampaignForm = () => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const { mutateAsync, isPending } = useCreateCampaign();
  const form = useForm({
    defaultValues: DEFAULT_CAMPAIGN_VALUES,
    resolver: zodResolver(CreateCampaignSchema)
  });
  const handleSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      {
        name: data.name,
        description: data.description,
        campaign_identifier: data.campaign_identifier,
        starts_at: data.starts_at,
        ends_at: data.ends_at,
        budget: {
          type: data.budget.type,
          limit: data.budget.limit ? data.budget.limit : void 0,
          currency_code: data.budget.currency_code
        }
      },
      {
        onSuccess: ({ campaign }) => {
          toast.success(
            t("campaigns.create.successToast", {
              name: campaign.name
            })
          );
          handleSuccess(`/campaigns/${campaign.id}`);
        },
        onError: (error) => {
          toast.error(error.message);
        }
      }
    );
  });
  return /* @__PURE__ */ jsx(RouteFocusModal.Form, { form, children: /* @__PURE__ */ jsxs(
    KeyboundForm,
    {
      onSubmit: handleSubmit,
      className: "flex size-full flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsxs(RouteFocusModal.Header, { children: [
          /* @__PURE__ */ jsx(RouteFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsx(VisuallyHidden, { children: t("campaigns.create.title") }) }),
          /* @__PURE__ */ jsx(RouteFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsx(VisuallyHidden, { children: t("campaigns.create.description") }) })
        ] }),
        /* @__PURE__ */ jsx(RouteFocusModal.Body, { className: "flex size-full flex-col items-center overflow-auto py-16", children: /* @__PURE__ */ jsx(CreateCampaignFormFields, { form }) }),
        /* @__PURE__ */ jsx(RouteFocusModal.Footer, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
          /* @__PURE__ */ jsx(RouteFocusModal.Close, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "small", variant: "secondary", children: t("actions.cancel") }) }),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "small",
              variant: "primary",
              type: "submit",
              isLoading: isPending,
              children: t("actions.create")
            }
          )
        ] }) })
      ]
    }
  ) });
};

export {
  DEFAULT_CAMPAIGN_VALUES,
  CreateCampaignSchema,
  CreateCampaignForm
};
