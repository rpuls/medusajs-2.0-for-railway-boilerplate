import {
  useDeleteProductType
} from "./chunk-S4HBRQEC.mjs";

// src/routes/product-types/common/hooks/use-delete-product-type-action.tsx
import { toast, usePrompt } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
var useDeleteProductTypeAction = (id) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const { mutateAsync } = useDeleteProductType(id);
  const handleDelete = async () => {
    const result = await prompt({
      title: t("general.areYouSure"),
      description: t("productTypes.delete.confirmation"),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel")
    });
    if (!result) {
      return;
    }
    await mutateAsync(void 0, {
      onSuccess: () => {
        toast.success(t("productTypes.delete.successToast"));
      },
      onError: (e) => {
        toast.error(e.message);
      }
    });
  };
  return handleDelete;
};

export {
  useDeleteProductTypeAction
};
