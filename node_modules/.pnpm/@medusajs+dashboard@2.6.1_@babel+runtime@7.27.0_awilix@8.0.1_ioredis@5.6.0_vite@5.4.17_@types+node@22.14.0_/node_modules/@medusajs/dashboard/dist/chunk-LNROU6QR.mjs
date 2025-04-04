import {
  useDeleteProductTag
} from "./chunk-XCF3TZQZ.mjs";

// src/routes/product-tags/common/hooks/use-delete-product-tag-action.tsx
import { toast, usePrompt } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
var useDeleteProductTagAction = ({
  productTag
}) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const navigate = useNavigate();
  const { mutateAsync } = useDeleteProductTag(productTag.id);
  const handleDelete = async () => {
    const confirmed = await prompt({
      title: t("general.areYouSure"),
      description: t("productTags.delete.confirmation", {
        value: productTag.value
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel")
    });
    if (!confirmed) {
      return;
    }
    await mutateAsync(void 0, {
      onSuccess: () => {
        toast.success(
          t("productTags.delete.successToast", {
            value: productTag.value
          })
        );
        navigate("/settings/product-tags", {
          replace: true
        });
      },
      onError: (error) => {
        toast.error(error.message);
      }
    });
  };
  return handleDelete;
};

export {
  useDeleteProductTagAction
};
