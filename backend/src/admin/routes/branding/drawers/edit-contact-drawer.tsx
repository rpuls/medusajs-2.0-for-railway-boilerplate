import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, Input, Textarea, toast, Drawer } from "@medusajs/ui";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse, ContactInfo } from "../../../lib/types";
import { Form } from "../common/form";

const EditContactSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type EditContactFormValues = z.infer<typeof EditContactSchema>;

export const EditContactDrawer = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useSWR<BrandingResponse>("branding", brandingFetcher);
  const contactInfo = data?.branding?.contact_info as ContactInfo | undefined;

  const form = useForm<EditContactFormValues>({
    defaultValues: {
      email: "",
      phone: "",
      address: "",
    },
    resolver: zodResolver(EditContactSchema),
  });

  useEffect(function openDrawer() {
    setOpen(true);
  }, []);

  useEffect(function updateFormData() {
    if (contactInfo && !form.formState.isDirty) {
      form.reset({
        email: contactInfo.email || "",
        phone: contactInfo.phone || "",
        address: contactInfo.address || "",
      });
    }
  }, [contactInfo, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate("/branding", { replace: true });
    }
    setOpen(open);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const hasContent = values.email || values.phone || values.address;
      await sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: {
          contact_info: hasContent
            ? {
                email: values.email || undefined,
                phone: values.phone || undefined,
                address: values.address || undefined,
              }
            : null,
        },
      });
      await mutate("branding");
      toast.success("Contact information updated successfully");
      navigate("/branding", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to update contact information");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>Edit Contact Information</Heading>
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
                  name="email"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>Email</Form.Label>
                      <Form.Control>
                        <Input type="email" placeholder="contact@example.com" {...field} />
                      </Form.Control>
                      <Form.Hint>Contact email displayed on your site</Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>Phone</Form.Label>
                      <Form.Control>
                        <Input placeholder="+1-555-123-4567" {...field} />
                      </Form.Control>
                      <Form.Hint>Contact phone number</Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>Address</Form.Label>
                      <Form.Control>
                        <Textarea placeholder="123 Main St, City, State 12345" {...field} />
                      </Form.Control>
                      <Form.Hint>Physical address or location</Form.Hint>
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

