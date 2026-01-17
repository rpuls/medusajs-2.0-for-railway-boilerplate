import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Heading,
  Input,
  Textarea,
  toast,
  Drawer,
  Text,
} from "@medusajs/ui";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse, SeoDefaults } from "../../../lib/types";
import { Form } from "../common/form";
import {
  FileUpload,
  FileType,
  RejectedFile,
} from "../../../components/common/file-upload";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const EditSeoSchema = z.object({
  site_tagline: z.string().optional(),
  meta_description_template: z.string().optional(),
  default_og_image_url: z.string().url().optional().or(z.literal("")),
});

type EditSeoFormValues = z.infer<typeof EditSeoSchema>;

export const EditSeoDrawer = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileType | null>(null);

  const { data, isLoading } = useSWR<BrandingResponse>(
    "branding",
    brandingFetcher
  );
  const seoDefaults = data?.branding?.seo_defaults as SeoDefaults | undefined;

  const form = useForm<EditSeoFormValues>({
    defaultValues: {
      site_tagline: "",
      meta_description_template: "",
      default_og_image_url: "",
    },
    resolver: zodResolver(EditSeoSchema),
  });

  useEffect(function openDrawer() {
    setOpen(true);
  }, []);

  useEffect(
    function updateFormData() {
      if (seoDefaults && !form.formState.isDirty) {
        form.reset({
          site_tagline: seoDefaults.site_tagline || "",
          meta_description_template:
            seoDefaults.meta_description_template || "",
          default_og_image_url: seoDefaults.default_og_image_url || "",
        });
      }
    },
    [seoDefaults, form]
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
      // Upload file first if provided
      let ogImageUrl = values.default_og_image_url;
      if (uploadedFile?.file) {
        const { files } = await sdk.admin.upload.create({
          files: [uploadedFile.file],
        });
        ogImageUrl = files[0]?.url || values.default_og_image_url;
      }

      const hasContent =
        values.site_tagline || values.meta_description_template || ogImageUrl;

      await sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: {
          seo_defaults: hasContent
            ? {
                site_tagline: values.site_tagline || undefined,
                meta_description_template:
                  values.meta_description_template || undefined,
                default_og_image_url: ogImageUrl || undefined,
              }
            : null,
        },
      });
      await mutate("branding");
      toast.success("SEO defaults updated successfully");
      navigate("/branding", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to update SEO defaults");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleFileUpload = (file: FileType) => {
    setUploadedFile(file);
  };

  const handleFileRemove = () => {
    if (uploadedFile?.url) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    setUploadedFile(null);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>Edit SEO Defaults</Heading>
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
              <Drawer.Body className="flex flex-col gap-y-8 overflow-y-auto">
                <Form.Field
                  control={form.control}
                  name="site_tagline"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>Site Tagline</Form.Label>
                      <Form.Control>
                        <Input
                          placeholder="Your trusted online store"
                          {...field}
                        />
                      </Form.Control>
                      <Form.Hint>
                        A short tagline describing your store
                      </Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="meta_description_template"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>
                        Meta Description Template
                      </Form.Label>
                      <Form.Control>
                        <Textarea
                          placeholder="{{product}} - Buy {{title}} at My Store. Free shipping on orders over $50."
                          rows={4}
                          {...field}
                        />
                      </Form.Control>
                      <Form.Hint>
                        Template for generating meta descriptions. Use{" "}
                        {"{{product}}"}, {"{{title}}"} as placeholders.
                      </Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="default_og_image_url"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>Default OG Image URL</Form.Label>
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-x-2 p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                            <img
                              src={uploadedFile.url}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <Text
                                size="small"
                                className="text-ui-fg-base truncate"
                              >
                                {uploadedFile.file.name}
                              </Text>
                              <Text size="xsmall" className="text-ui-fg-muted">
                                {(uploadedFile.file.size / 1024).toFixed(2)} KB
                              </Text>
                            </div>
                            <Button
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={handleFileRemove}
                            >
                              Remove
                            </Button>
                          </div>
                          <Form.Hint>
                            Uploaded file will replace URL input
                          </Form.Hint>
                        </div>
                      ) : (
                        <>
                          <Form.Control>
                            <Input
                              placeholder="https://example.com/og-image.jpg"
                              {...field}
                            />
                          </Form.Control>
                          <Form.Hint>
                            Default image used when sharing on social media. Or
                            upload a file below.
                          </Form.Hint>
                        </>
                      )}
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                {!uploadedFile && (
                  <FileUpload
                    label="Upload OG Image"
                    hint="Drag and drop an image here or click to upload"
                    formats={SUPPORTED_IMAGE_FORMATS}
                    multiple={false}
                    maxFileSize={5 * 1024 * 1024} // 5MB
                    onUploaded={(files, rejectedFiles) => {
                      // Handle rejected files first
                      if (rejectedFiles && rejectedFiles.length > 0) {
                        const sizeRejected = rejectedFiles.filter(
                          (f: RejectedFile) => f.reason === "size"
                        );
                        const formatRejected = rejectedFiles.filter(
                          (f: RejectedFile) => f.reason === "format"
                        );

                        if (sizeRejected.length > 0) {
                          const file = sizeRejected[0];
                          const fileSizeMB = (
                            file.file.size /
                            (1024 * 1024)
                          ).toFixed(2);
                          toast.error(
                            `File "${file.file.name}" is too large (${fileSizeMB} MB). Maximum file size is 5 MB.`
                          );
                        }

                        if (formatRejected.length > 0) {
                          const file = formatRejected[0];
                          toast.error(
                            `File "${file.file.name}" is not a supported image format.`
                          );
                        }

                        return; // Don't process files if there are rejections
                      }

                      // Process valid files
                      if (files.length > 0) {
                        handleFileUpload(files[0]);
                      }
                    }}
                  />
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
