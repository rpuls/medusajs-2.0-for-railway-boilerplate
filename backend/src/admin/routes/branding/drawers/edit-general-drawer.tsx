import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, Input, Textarea, toast, Drawer } from "@medusajs/ui";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse } from "../../../lib/types";
import { Form } from "../common/form";

const EditGeneralSchema = z.object({
  site_title: z.string().optional(),
  copyright_text: z.string().optional(),
});

type EditGeneralFormValues = z.infer<typeof EditGeneralSchema>;

export const EditGeneralDrawer = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useSWR<BrandingResponse>("branding", brandingFetcher);

  const form = useForm<EditGeneralFormValues>({
    defaultValues: {
      site_title: data?.branding?.site_title || "",
      copyright_text: data?.branding?.copyright_text || "",
    },
    resolver: zodResolver(EditGeneralSchema),
  });

  // Open drawer on mount
  useEffect(function openDrawer() {
    setOpen(true);
  }, []);

  // Update form when data loads
  useEffect(function updateFormData() {
    if (data?.branding && !form.formState.isDirty) {
      form.reset({
        site_title: data.branding.site_title || "",
        copyright_text: data.branding.copyright_text || "",
      });
    }
  }, [data, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate("/branding", { replace: true });
    }
    setOpen(open);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: values,
      });
      await mutate("branding");
      toast.success("General settings updated successfully");
      navigate("/branding", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to update general settings");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>Edit General Settings</Heading>
        </Drawer.Header>
        {isLoading ? (
          <Drawer.Body>
            <div className="flex items-center justify-center py-8">
              <div className="text-ui-fg-subtle">Loading...</div>
            </div>
          </Drawer.Body>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <Drawer.Body className="flex flex-col gap-y-8 overflow-y-auto">
                <Form.Field
                  control={form.control}
                  name="site_title"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Site Title</Form.Label>
                      <Form.Control>
                        <Input placeholder="My Store" {...field} />
                      </Form.Control>
                      <Form.Hint>The name of your store displayed across the site</Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="copyright_text"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>Copyright Text</Form.Label>
                      <Form.Control>
                        <Textarea
                          placeholder="© 2024 My Store. All rights reserved."
                          {...field}
                        />
                      </Form.Control>
                      <Form.Hint>Copyright notice displayed in the footer</Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
              </Drawer.Body>
              <Drawer.Footer>
                <div className="flex items-center justify-end gap-x-2">
                  <Drawer.Close asChild>
                    <Button size="small" variant="secondary">
                      Cancel
                    </Button>
                  </Drawer.Close>
                  <Button size="small" type="submit" isLoading={isSubmitting}>
                    Save
                  </Button>
                </div>
              </Drawer.Footer>
            </form>
          </Form>
        )}
      </Drawer.Content>
    </Drawer>
  );
};

