import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import {
  RouteFocusModal,
  useRouteModal,
} from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import { useCreateBrand } from "../../../../../hooks/api/brands"

const CreateBrandSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, t("brands.fields.name.label") + " is required"),
  image_url: z.string().url().optional().or(z.literal("")),
})

type CreateBrandFormValues = z.infer<typeof CreateBrandSchema>

export const CreateBrandForm = () => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const form = useForm<CreateBrandFormValues>({
    defaultValues: {
      name: "",
      image_url: "",
    },
    resolver: zodResolver(CreateBrandSchema(t)),
  })

  const { mutateAsync, isPending } = useCreateBrand()

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await mutateAsync({
        name: data.name,
        image_url: data.image_url || null,
      })
      toast.success(t("brands.create.successToast"))
      handleSuccess(`/brands/${result.brand.id}`)
    } catch (error) {
      toast.error(t("general.error"))
    }
  })

  return (
    <RouteFocusModal.Form form={form}>
      <form onSubmit={handleSubmit}>
        <RouteFocusModal.Body>
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
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer>
          <RouteFocusModal.Close asChild>
            <Button variant="secondary" size="small">
              {t("actions.cancel")}
            </Button>
          </RouteFocusModal.Close>
          <Button type="submit" size="small" isLoading={isPending}>
            {t("brands.create.header")}
          </Button>
        </RouteFocusModal.Footer>
      </form>
    </RouteFocusModal.Form>
  )
}

