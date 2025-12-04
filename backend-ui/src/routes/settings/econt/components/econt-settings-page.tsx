import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Container, Heading, Input, Switch, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { Form } from "../../../../components/common/form"
import { KeyboundForm } from "../../../../components/utilities/keybound-form"
import { sdk, backendUrl } from "../../../../lib/client"

export const EcontSettingsPage = () => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create schema with translations
  const EcontSettingsSchema = z.object({
    username: z.string().min(1, t("app.nav.settings.econt.validation.usernameRequired")),
    password: z.string().min(1, t("app.nav.settings.econt.validation.passwordRequired")),
    live: z.boolean().default(false),
    sender_type: z.enum(["OFFICE", "ADDRESS"]).default("OFFICE"),
    sender_city: z.string().min(1, t("app.nav.settings.econt.validation.cityRequired")),
    sender_post_code: z.string().min(1, t("app.nav.settings.econt.validation.postCodeRequired")),
    sender_office_code: z.string().optional(),
    sender_street: z.string().optional(),
    sender_street_num: z.string().optional(),
    sender_quarter: z.string().optional(),
    sender_building_num: z.string().optional(),
    sender_entrance_num: z.string().optional(),
    sender_floor_num: z.string().optional(),
    sender_apartment_num: z.string().optional(),
  })

  type EcontSettingsFormData = z.infer<typeof EcontSettingsSchema>

  const form = useForm<EcontSettingsFormData>({
    resolver: zodResolver(EcontSettingsSchema),
    defaultValues: {
      username: "",
      password: "",
      live: false,
      sender_type: "OFFICE",
      sender_city: "",
      sender_post_code: "",
      sender_office_code: "",
      sender_street: "",
      sender_street_num: "",
      sender_quarter: "",
      sender_building_num: "",
      sender_entrance_num: "",
      sender_floor_num: "",
      sender_apartment_num: "",
    },
  })

  const senderType = form.watch("sender_type")

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const response = await sdk.client.fetch<{ settings: any }>("/admin/econt/settings", {
          method: "GET",
        })
        
        if (response.settings) {
          // Don't populate password field if it's empty (for security)
          form.reset({
            ...response.settings,
            password: response.settings.password || "",
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t("app.nav.settings.econt.loadError")
        setError(errorMessage)
        toast.error(errorMessage)
        // Still set loading to false so form can be displayed
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [form])

  const onSubmit = form.handleSubmit(async (data: EcontSettingsFormData) => {
    try {
      setIsSaving(true)
      
      // Use native fetch to avoid SDK body transformation issues
      const url = `${backendUrl}/admin/econt/settings`
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include session cookies
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save Econt settings")
      }

      const result = await response.json()

      toast.success(t("app.nav.settings.econt.saveSuccess"))
      
      // Reload settings to get updated data
      if (result.settings) {
        form.reset({
          ...result.settings,
          password: data.password, // Keep the password the user entered
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("app.nav.settings.econt.saveError")
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  })
  
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{t("app.nav.settings.econt.title")}</Heading>
        </div>
      </div>

      <div className="px-6 py-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{t("general.error")}: {error}</p>
            <p className="text-red-600 text-xs mt-1">{t("app.nav.settings.econt.errorMessage")}</p>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-ui-fg-subtle">{t("app.nav.settings.econt.loading")}</p>
          </div>
        ) : (
          <Form {...form}>
            <KeyboundForm onSubmit={onSubmit}>
              <div className="flex flex-col gap-y-8">
          {/* API Credentials Section */}
          <div className="flex flex-col gap-y-4">
            <Heading level="h2">{t("app.nav.settings.econt.apiCredentials.title")}</Heading>
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="username"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t("app.nav.settings.econt.apiCredentials.username")}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="password"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t("app.nav.settings.econt.apiCredentials.password")}</Form.Label>
                    <Form.Control>
                      <Input {...field} type="password" />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            </div>
            <Form.Field
              control={form.control}
              name="live"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-0.5">
                      <Form.Label>{t("app.nav.settings.econt.apiCredentials.liveMode")}</Form.Label>
                      <Form.Hint>
                        {t("app.nav.settings.econt.apiCredentials.liveModeHint")}
                      </Form.Hint>
                    </div>
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                  </div>
                </Form.Item>
              )}
            />
          </div>

          {/* Sender Address Section */}
          <div className="flex flex-col gap-y-4">
            <Heading level="h2">{t("app.nav.settings.econt.senderAddress.title")}</Heading>
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="sender_city"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t("app.nav.settings.econt.senderAddress.city")}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="sender_post_code"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t("app.nav.settings.econt.senderAddress.postCode")}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            </div>

            <Form.Field
              control={form.control}
              name="sender_type"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t("app.nav.settings.econt.senderAddress.senderType")}</Form.Label>
                  <Form.Control>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-ui-border-base rounded-md"
                    >
                      <option value="OFFICE">{t("app.nav.settings.econt.senderAddress.office")}</option>
                      <option value="ADDRESS">{t("app.nav.settings.econt.senderAddress.address")}</option>
                    </select>
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />

            {senderType === "OFFICE" && (
              <Form.Field
                control={form.control}
                name="sender_office_code"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t("app.nav.settings.econt.senderAddress.officeCode")}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            )}

            {senderType === "ADDRESS" && (
              <div className="flex flex-col gap-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
                    name="sender_street"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t("app.nav.settings.econt.senderAddress.street")}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="sender_street_num"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t("app.nav.settings.econt.senderAddress.streetNumber")}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
                    name="sender_quarter"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t("app.nav.settings.econt.senderAddress.quarter")}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="sender_building_num"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t("app.nav.settings.econt.senderAddress.buildingNumber")}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Form.Field
                    control={form.control}
                    name="sender_entrance_num"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t("app.nav.settings.econt.senderAddress.entrance")}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="sender_floor_num"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t("app.nav.settings.econt.senderAddress.floor")}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="sender_apartment_num"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t("app.nav.settings.econt.senderAddress.apartment")}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-x-2">
            <Button type="submit" isLoading={isSaving}>
              {t("app.nav.settings.econt.saveButton")}
            </Button>
          </div>
              </div>
            </KeyboundForm>
          </Form>
        )}
      </div>
    </Container>
  )
}


