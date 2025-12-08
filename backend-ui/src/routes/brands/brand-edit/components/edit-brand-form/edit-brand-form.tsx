import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import {
  RouteDrawer,
  useRouteModal,
} from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import { Brand, useUpdateBrand } from "../../../../../hooks/api/brands"

const EditBrandSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, t("brands.fields.name.label") + " is required"),
  image_url: z.string().url().optional().or(z.literal("")),
})

type EditBrandFormValues = z.infer<typeof EditBrandSchema>

export const EditBrandForm = ({ brand }: { brand: Brand }) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const form = useForm<EditBrandFormValues>({
    defaultValues: {
      name: brand.name,
      image_url: brand.image_url || "",
    },
    resolver: zodResolver(EditBrandSchema(t)),
  })

  const { mutateAsync, isPending } = useUpdateBrand(brand.id)

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await mutateAsync({
        name: data.name,
        image_url: data.image_url || null,
      })
      toast.success(t("brands.edit.successToast"))
      handleSuccess()
    } catch (error) {
      toast.error(t("general.error"))
    }
  })

  return (
    <RouteDrawer.Form form={form}>
      <form onSubmit={handleSubmit}>
        <RouteDrawer.Body>
          <KeyboundForm>
            <div className="flex flex-col gap-y-4">
              <Input
                label={t("brands.fields.name.label")}
                {...form.register("name")}
                error={form.formState.errors.name?.message}
                required
              />
              <Input
                label={t("brands.fields.image.url.label")}
                {...form.register("image_url")}
                error={form.formState.errors.image_url?.message}
                placeholder={t("brands.fields.image.url.placeholder")}
              />
            </div>
          </KeyboundForm>
        </RouteDrawer.Body>
        <RouteDrawer.Footer>
          <RouteDrawer.Close asChild>
            <Button variant="secondary" size="small">
              {t("actions.cancel")}
            </Button>
          </RouteDrawer.Close>
          <Button type="submit" size="small" isLoading={isPending}>
            {t("actions.save")}
          </Button>
        </RouteDrawer.Footer>
      </form>
    </RouteDrawer.Form>
  )
}

