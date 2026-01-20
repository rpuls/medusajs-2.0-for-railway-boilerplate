import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Heading,
  Input,
  IconButton,
  toast,
  Drawer,
  Select,
} from "@medusajs/ui";
import { Plus, Trash } from "@medusajs/icons";
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse, SocialLink } from "../../../lib/types";
import { Form } from "../common/form";

const SOCIAL_PLATFORMS = [
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "pinterest",
  "snapchat",
  "whatsapp",
  "telegram",
  "discord",
  "github",
  "dribbble",
  "behance",
  "medium",
  "reddit",
] as const;

const SocialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS, {
    required_error: "Platform is required",
  }),
  url: z.string().url("Must be a valid URL"),
});

const EditSocialSchema = z.object({
  social_links: z.array(SocialLinkSchema),
});

type EditSocialFormValues = z.infer<typeof EditSocialSchema>;

export const EditSocialDrawer = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useSWR<BrandingResponse>(
    "branding",
    brandingFetcher
  );
  const socialLinks = data?.branding?.social_links as SocialLink[] | undefined;

  const form = useForm<EditSocialFormValues>({
    defaultValues: {
      social_links: [],
    },
    resolver: zodResolver(EditSocialSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social_links",
  });

  useEffect(function openDrawer() {
    setOpen(true);
  }, []);

  useEffect(
    function loadSocialLinks() {
      if (
        socialLinks &&
        socialLinks.length > 0 &&
        fields.length === 0 &&
        !form.formState.isDirty
      ) {
        // Filter and cast to valid platforms only
        const validLinks = socialLinks
          .filter((link) => SOCIAL_PLATFORMS.includes(link.platform as any))
          .map((link) => ({
            platform: link.platform as (typeof SOCIAL_PLATFORMS)[number],
            url: link.url,
          }));
        if (validLinks.length > 0) {
          form.reset({ social_links: validLinks });
        }
      }
    },
    [socialLinks, fields.length, form]
  );

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
        body: {
          social_links:
            values.social_links.length > 0 ? values.social_links : null,
        },
      });
      await mutate("branding");
      toast.success("Social links updated successfully");
      navigate("/branding", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to update social links");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleAddLink = () => {
    // Get all currently selected platforms
    const allSelectedPlatforms = form
      .watch("social_links")
      .map((link) => link?.platform);
    // Find the first available platform
    const availablePlatform = SOCIAL_PLATFORMS.find(
      (platform) => !allSelectedPlatforms.includes(platform)
    );
    // Use the first available platform, or the first platform if all are taken
    append({
      platform: availablePlatform || SOCIAL_PLATFORMS[0],
      url: "",
    });
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>Edit Social Links</Heading>
        </Drawer.Header>
        {isLoading ? (
          <Drawer.Body>
            <div className="flex items-center justify-center py-8">
              <div className="text-ui-fg-subtle">Loading...</div>
            </div>
          </Drawer.Body>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
                {fields.length === 0 ? (
                  <div className="text-ui-fg-subtle flex flex-col items-center justify-center py-8">
                    <p className="mb-4">No social links configured</p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleAddLink}
                    >
                      <Plus />
                      Add Social Link
                    </Button>
                  </div>
                ) : (
                  <>
                    {fields.map((field, index) => {
                      // Get all currently selected platforms
                      const allSelectedPlatforms = form
                        .watch("social_links")
                        .map((link) => link?.platform);
                      // Get available platforms (exclude already selected ones, except current)
                      const availablePlatforms = SOCIAL_PLATFORMS.filter(
                        (platform) =>
                          !allSelectedPlatforms.includes(platform) ||
                          allSelectedPlatforms[index] === platform
                      );

                      return (
                        <div
                          key={field.id}
                          className="bg-ui-bg-subtle rounded-lg border p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <span className="text-ui-fg-subtle text-sm font-medium">
                              Link {index + 1}
                            </span>
                            <IconButton
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={() => remove(index)}
                            >
                              <Trash className="text-ui-fg-subtle" />
                            </IconButton>
                          </div>
                          <div className="flex flex-col gap-y-4">
                            <Form.Field
                              control={form.control}
                              name={`social_links.${index}.platform`}
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Label>Platform</Form.Label>
                                  <Form.Control>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <Select.Trigger>
                                        <Select.Value placeholder="Select platform" />
                                      </Select.Trigger>
                                      <Select.Content>
                                        {availablePlatforms.length === 0 ? (
                                          <Select.Item value="" disabled>
                                            No platforms available
                                          </Select.Item>
                                        ) : (
                                          availablePlatforms.map((platform) => (
                                            <Select.Item
                                              key={platform}
                                              value={platform}
                                            >
                                              {platform
                                                .charAt(0)
                                                .toUpperCase() +
                                                platform.slice(1)}
                                            </Select.Item>
                                          ))
                                        )}
                                      </Select.Content>
                                    </Select>
                                  </Form.Control>
                                  <Form.ErrorMessage />
                                </Form.Item>
                              )}
                            />
                            <Form.Field
                              control={form.control}
                              name={`social_links.${index}.url`}
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Label>URL</Form.Label>
                                  <Form.Control>
                                    <Input
                                      placeholder="https://facebook.com/yourpage"
                                      {...field}
                                    />
                                  </Form.Control>
                                  <Form.ErrorMessage />
                                </Form.Item>
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleAddLink}
                      className="self-start shrink-0"
                    >
                      <Plus />
                      Add Social Link
                    </Button>
                  </>
                )}
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
