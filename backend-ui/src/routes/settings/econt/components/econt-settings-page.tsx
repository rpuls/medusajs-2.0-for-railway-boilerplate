"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Heading, Input, Switch, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { Form } from "../../../../components/common/form"
import { KeyboundForm } from "../../../../components/utilities/keybound-form"
import { sdk } from "../../../../lib/client"

const EcontSettingsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  live: z.boolean().default(false),
  sender_type: z.enum(["OFFICE", "ADDRESS"]).default("OFFICE"),
  sender_city: z.string().min(1, "Sender city is required"),
  sender_post_code: z.string().min(1, "Sender post code is required"),
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

export const EcontSettingsPage = () => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
        const response = await fetch("/admin/econt/settings")
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            // Don't populate password field if it's empty (for security)
            form.reset({
              ...data.settings,
              password: data.settings.password || "",
            })
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast.error("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [form])

  const onSubmit = async (data: EcontSettingsFormData) => {
    try {
      setIsSaving(true)
      const response = await fetch("/admin/econt/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Settings saved successfully")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ui-fg-subtle">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <Heading>Econt Shipping Settings</Heading>
      </div>

      <KeyboundForm form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-y-8">
          {/* API Credentials Section */}
          <div className="flex flex-col gap-y-4">
            <Heading level="h2">API Credentials</Heading>
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="username"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Username</Form.Label>
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
                    <Form.Label>Password</Form.Label>
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
                      <Form.Label>Live Mode</Form.Label>
                      <Form.Hint>
                        Enable for production, disable for testing
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
            <Heading level="h2">Sender Address</Heading>
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="sender_city"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>City</Form.Label>
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
                    <Form.Label>Post Code</Form.Label>
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
                  <Form.Label>Sender Type</Form.Label>
                  <Form.Control>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-ui-border-base rounded-md"
                    >
                      <option value="OFFICE">Office</option>
                      <option value="ADDRESS">Address</option>
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
                    <Form.Label>Office Code</Form.Label>
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
                        <Form.Label>Street</Form.Label>
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
                        <Form.Label>Street Number</Form.Label>
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
                        <Form.Label>Quarter (Optional)</Form.Label>
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
                        <Form.Label>Building Number (Optional)</Form.Label>
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
                        <Form.Label>Entrance (Optional)</Form.Label>
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
                        <Form.Label>Floor (Optional)</Form.Label>
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
                        <Form.Label>Apartment (Optional)</Form.Label>
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
              Save Settings
            </Button>
          </div>
        </div>
      </KeyboundForm>
    </div>
  )
}


