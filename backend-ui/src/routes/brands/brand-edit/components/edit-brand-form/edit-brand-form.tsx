import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Form } from "../../../../../components/common/form"
import {
  RouteDrawer,
  useRouteModal,
} from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import { Brand, useUpdateBrand } from "../../../../../hooks/api/brands"

export const EditBrandForm = ({ brand }: { brand: Brand }) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const editBrandSchema = z.object({
    name: z.string().min(1, t("brands.fields.name.label") + " " + t("validation.required")),
    image_url: z.string().url(t("validation.invalidUrl") || "Invalid URL").optional().or(z.literal("")),
  })

  type EditBrandFormValues = z.infer<typeof editBrandSchema>

  const form = useForm<EditBrandFormValues>({
    defaultValues: {
      name: brand.name,
      image_url: brand.image_url || "",
    },
    resolver: zodResolver(editBrandSchema),
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
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex h-full flex-col overflow-hidden"
      >
        <RouteDrawer.Body>
          <div className="flex flex-col gap-y-6 px-6 py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label>{t("brands.fields.name.label")}</Form.Label>
                      <Form.Control>
                        <Input autoComplete="off" {...field} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )
                }}
              />
              <Form.Field
                control={form.control}
                name="image_url"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label optional>
                        {t("brands.fields.image.url.label")}
                      </Form.Label>
                      <Form.Control>
                        <Input
                          autoComplete="off"
                          placeholder={t("brands.fields.image.url.placeholder")}
                          {...field}
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )
                }}
              />
            </div>
          </div>
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
      </KeyboundForm>
    </RouteDrawer.Form>
  )
}

