import { Button, Heading, toast, Drawer, Text, IconButton } from "@medusajs/ui";
import { Trash } from "@medusajs/icons";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useNavigate, useSearchParams } from "react-router-dom";

import { sdk } from "../lib/sdk";
import { FileUpload, FileType, RejectedFile } from "../components/common/file-upload";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

type CategoryImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
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
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
};

const categoryFetcher = async (categoryId: string) => {
  return await sdk.admin.productCategory.retrieve(categoryId, {
    fields: "+metadata",
  });
};

export const EditCategoryImageDrawer = ({
  categoryId,
}: {
  categoryId: string;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileType | null>(null);

  const { data, isLoading } = useSWR(
    [`category`, categoryId],
    () => categoryFetcher(categoryId)
  );

  const categoryData = data?.product_category as {
    id: string;
    metadata?: { image?: CategoryImage };
  } | undefined;
  const imageData = categoryData?.metadata?.image;

  useEffect(function openDrawer() {
    if (searchParams.get("edit") === "category-image") {
      setOpen(true);
    }
  }, [searchParams]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("edit");
      navigate(
        { search: newSearchParams.toString() },
        { replace: true }
      );
    }
    setOpen(open);
  };

  const handleFileUpload = async (
    files: FileType[],
    rejectedFiles?: RejectedFile[]
  ) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const sizeRejected = rejectedFiles.filter(
        (f: RejectedFile) => f.reason === "size"
      );
      const formatRejected = rejectedFiles.filter(
        (f: RejectedFile) => f.reason === "format"
      );

      if (sizeRejected.length > 0) {
        const file = sizeRejected[0];
        const fileSizeMB = (file.file.size / (1024 * 1024)).toFixed(2);
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

      return;
    }

    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleRemove = () => {
    if (uploadedFile?.url) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    setUploadedFile(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentMetadata = categoryData?.metadata || {};

      if (uploadedFile) {
        // Upload file first
        const { files } = await sdk.admin.upload.create({
          files: [uploadedFile.file],
        });

        if (files.length > 0) {
          // Get image dimensions
          const { width, height } = await getImageDimensions(uploadedFile.file);

          // Extract alt text from image filename (remove extension)
          const altText = uploadedFile.file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]/g, " ");

          const image: CategoryImage = {
            url: files[0].url,
            alt: altText,
            width: width || 0,
            height: height || 0,
          };

          await sdk.admin.productCategory.update(categoryId, {
            metadata: {
              ...currentMetadata,
              image,
            },
          });
        }
      } else {
        // Remove image
        const { image, ...restMetadata } = currentMetadata;
        await sdk.admin.productCategory.update(categoryId, {
          metadata: restMetadata,
        });
      }

      mutate([`category`, categoryId]);
      toast.success("Category image updated successfully");
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update category image");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsSubmitting(true);
    try {
      const currentMetadata = categoryData?.metadata || {};
      const { image, ...restMetadata } = currentMetadata;

      await sdk.admin.productCategory.update(categoryId, {
        metadata: restMetadata,
      });

      mutate([`category`, categoryId]);
      toast.success("Category image removed successfully");
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove image");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>Edit Category Image</Heading>
        </Drawer.Header>
        {isLoading ? (
          <Drawer.Body>
            <div className="flex items-center justify-center py-8">
              <div className="text-ui-fg-subtle">Loading...</div>
            </div>
          </Drawer.Body>
        ) : (
          <Drawer.Body className="flex flex-col gap-y-8 overflow-y-auto">
            {imageData?.url && (
              <div className="space-y-4">
                <div className="flex items-center gap-x-4">
                  <div className="bg-ui-bg-component flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border">
                    <img
                      src={imageData.url}
                      alt={imageData.alt || "Category image"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-y-2 flex-1">
                    <Text size="small" className="text-ui-fg-base">
                      {imageData.width}x{imageData.height}px
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {imageData.alt || "-"}
                    </Text>
                  </div>
                  <IconButton
                    size="small"
                    variant="transparent"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    <Trash />
                  </IconButton>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Heading level="h3">Upload New Image</Heading>
              <FileUpload
                label="Upload Image"
                hint="Drag and drop an image here or click to upload"
                formats={SUPPORTED_IMAGE_FORMATS}
                multiple={false}
                maxFileSize={5 * 1024 * 1024} // 5MB
                onUploaded={handleFileUpload}
              />
              {uploadedFile && (
                <div className="space-y-4">
                  <div className="flex items-center gap-x-4">
                    <div className="bg-ui-bg-component flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border">
                      <img
                        src={uploadedFile.url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Text size="small" className="text-ui-fg-base">
                        {uploadedFile.file.name}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {(uploadedFile.file.size / 1024).toFixed(2)} KB
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={handleRemove}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      onClick={handleSubmit}
                      isLoading={isSubmitting}
                    >
                      Save Image
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Drawer.Body>
        )}
        <Drawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <Drawer.Close asChild>
              <Button size="small" variant="secondary">
                Cancel
              </Button>
            </Drawer.Close>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

