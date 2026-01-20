import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, Input, toast, Drawer, Text } from "@medusajs/ui";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse, Logos } from "../../../lib/types";
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
  "image/svg+xml",
];

const LogoSchema = z.object({
  url: z.string().url().optional().or(z.literal("")),
  alt: z.string().optional(),
  width: z.coerce.number().positive().optional().or(z.literal("")),
  height: z.coerce.number().positive().optional().or(z.literal("")),
});

const EditLogosSchema = z.object({
  main: LogoSchema.optional(),
  footer: LogoSchema.optional(),
  favicon: LogoSchema.optional(),
});

type EditLogosFormValues = z.infer<typeof EditLogosSchema>;

const getRatioRecommendation = (
  prefix: "main" | "footer" | "favicon"
): string => {
  switch (prefix) {
    case "main":
    case "footer":
      return "Recommended aspect ratio: 4:1 or 3:1 (horizontal logo)";
    case "favicon":
      return "Recommended: 1:1 (square), ideally 32×32px or 64×64px";
    default:
      return "";
  }
};

const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Default to 0 if image can't be loaded
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
};

const LogoFields = ({
  prefix,
  label,
  control,
  uploadedFile,
  onFileUpload,
  onFileRemove,
}: {
  prefix: "main" | "footer" | "favicon";
  label: string;
  control: any;
  uploadedFile: FileType | null;
  onFileUpload: (file: FileType) => void;
  onFileRemove: () => void;
}) => (
  <div className="space-y-4">
    <Heading level="h3" className="text-ui-fg-base">
      {label}
    </Heading>
    <div className="space-y-4">
      <div>
        <Form.Field
          control={control}
          name={`${prefix}.url`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label optional>Image URL</Form.Label>
              {uploadedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-x-2 p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                    <img
                      src={uploadedFile.url}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <Text size="small" className="text-ui-fg-base truncate">
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
                      onClick={onFileRemove}
                    >
                      Remove
                    </Button>
                  </div>
                  <Form.Hint>Uploaded file will replace URL input</Form.Hint>
                </div>
              ) : (
                <>
                  <Form.Control>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                    />
                  </Form.Control>
                  <Form.Hint>Or upload a file below</Form.Hint>
                </>
              )}
              <Form.ErrorMessage />
            </Form.Item>
          )}
        />
      </div>
      {!uploadedFile && (
        <div className="space-y-2">
          <FileUpload
            label="Upload Image"
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
                  const fileSizeMB = (file.file.size / (1024 * 1024)).toFixed(
                    2
                  );
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
                onFileUpload(files[0]);
              }
            }}
          />
          <Text size="xsmall" className="text-ui-fg-muted">
            {getRatioRecommendation(prefix)}
          </Text>
        </div>
      )}
      <div>
        <Form.Field
          control={control}
          name={`${prefix}.alt`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label optional>Alt Text</Form.Label>
              <Form.Control>
                <Input placeholder="Logo description" {...field} />
              </Form.Control>
              <Form.ErrorMessage />
            </Form.Item>
          )}
        />
      </div>
    </div>
  </div>
);

export const EditLogosDrawer = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    main: FileType | null;
    footer: FileType | null;
    favicon: FileType | null;
  }>({
    main: null,
    footer: null,
    favicon: null,
  });

  const { data, isLoading } = useSWR<BrandingResponse>(
    "branding",
    brandingFetcher
  );
  const logos = data?.branding?.logos as Logos | undefined;

  const form = useForm<EditLogosFormValues>({
    defaultValues: {
      main: { url: "", alt: "", width: "", height: "" },
      footer: { url: "", alt: "", width: "", height: "" },
      favicon: { url: "", alt: "", width: "", height: "" },
    },
    resolver: zodResolver(EditLogosSchema),
  });

  useEffect(function openDrawer() {
    setOpen(true);
  }, []);

  useEffect(
    function updateFormData() {
      if (logos && !form.formState.isDirty) {
        form.reset({
          main: {
            url: logos?.main?.url || "",
            alt: logos?.main?.alt || "",
            width: (logos?.main?.width?.toString() || "") as any,
            height: (logos?.main?.height?.toString() || "") as any,
          },
          footer: {
            url: logos?.footer?.url || "",
            alt: logos?.footer?.alt || "",
            width: (logos?.footer?.width?.toString() || "") as any,
            height: (logos?.footer?.height?.toString() || "") as any,
          },
          favicon: {
            url: logos?.favicon?.url || "",
            alt: logos?.favicon?.alt || "",
            width: (logos?.favicon?.width?.toString() || "") as any,
            height: (logos?.favicon?.height?.toString() || "") as any,
          },
        });
      }
    },
    [logos, form]
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
      // Upload files first if any are provided
      const filesToUpload = [
        uploadedFiles.main?.file,
        uploadedFiles.footer?.file,
        uploadedFiles.favicon?.file,
      ].filter((f): f is File => !!f);

      let uploadedUrls: string[] = [];
      if (filesToUpload.length > 0) {
        const { files } = await sdk.admin.upload.create({
          files: filesToUpload,
        });
        uploadedUrls = files.map((f) => f.url);
      }

      // Build URLs array in order: main, footer, favicon
      let urlIndex = 0;
      const getLogoUrl = (prefix: "main" | "footer" | "favicon") => {
        if (uploadedFiles[prefix]?.file) {
          return uploadedUrls[urlIndex++];
        }
        return values[prefix]?.url || "";
      };

      const cleanLogo = (logo: any, url: string) => {
        if (!url) return undefined;
        return {
          url,
          alt: logo?.alt || "",
          width: Number(logo?.width) || 0,
          height: Number(logo?.height) || 0,
        };
      };

      const logos = {
        main: cleanLogo(values.main, getLogoUrl("main")),
        footer: cleanLogo(values.footer, getLogoUrl("footer")),
        favicon: cleanLogo(values.favicon, getLogoUrl("favicon")),
      };

      const hasLogos = logos.main || logos.footer || logos.favicon;

      await sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: { logos: hasLogos ? logos : null },
      });
      await mutate("branding");
      toast.success("Logos updated successfully");
      navigate("/branding", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to update logos");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleFileUpload =
    (prefix: "main" | "footer" | "favicon") => async (file: FileType) => {
      setUploadedFiles((prev) => ({ ...prev, [prefix]: file }));

      // Auto-detect and set dimensions from uploaded image
      try {
        const { width, height } = await getImageDimensions(file.file);
        form.setValue(`${prefix}.width`, width.toString() as any);
        form.setValue(`${prefix}.height`, height.toString() as any);
      } catch (error) {
        // Fail silently, dimensions will remain 0
      }
    };

  const handleFileRemove = (prefix: "main" | "footer" | "favicon") => () => {
    const file = uploadedFiles[prefix];
    if (file?.url) {
      URL.revokeObjectURL(file.url);
    }
    setUploadedFiles((prev) => ({ ...prev, [prefix]: null }));
    // Reset dimensions when file is removed
    form.setValue(`${prefix}.width`, "" as any);
    form.setValue(`${prefix}.height`, "" as any);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>Edit Logos</Heading>
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
                <LogoFields
                  prefix="main"
                  label="Main Logo"
                  control={form.control}
                  uploadedFile={uploadedFiles.main}
                  onFileUpload={handleFileUpload("main")}
                  onFileRemove={handleFileRemove("main")}
                />
                <div className="border-ui-border-base -mx-6 border-t" />
                <LogoFields
                  prefix="footer"
                  label="Footer Logo"
                  control={form.control}
                  uploadedFile={uploadedFiles.footer}
                  onFileUpload={handleFileUpload("footer")}
                  onFileRemove={handleFileRemove("footer")}
                />
                <div className="border-ui-border-base -mx-6 border-t" />
                <LogoFields
                  prefix="favicon"
                  label="Favicon"
                  control={form.control}
                  uploadedFile={uploadedFiles.favicon}
                  onFileUpload={handleFileUpload("favicon")}
                  onFileRemove={handleFileRemove("favicon")}
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
