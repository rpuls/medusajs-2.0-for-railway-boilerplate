import {
  useDeletePriceList
} from "./chunk-HGVADKNP.mjs";

// src/routes/price-lists/common/hooks/use-delete-price-list-action.tsx
import { toast, usePrompt } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
var useDeletePriceListAction = ({
  priceList
}) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const navigate = useNavigate();
  const { mutateAsync } = useDeletePriceList(priceList.id);
  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("priceLists.delete.confirmation", {
        title: priceList.title
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel")
    });
    if (!res) {
      return;
    }
    await mutateAsync(void 0, {
      onSuccess: () => {
        toast.success(
          t("priceLists.delete.successToast", {
            title: priceList.title
          })
        );
        navigate("/price-lists");
      },
      onError: (e) => {
        toast.error(e.message);
      }
    });
  };
  return handleDelete;
};

export {
  useDeletePriceListAction
};
