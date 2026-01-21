import { Button, Heading, toast, Drawer, Text, IconButton } from "@medusajs/ui";
import { Trash } from "@medusajs/icons";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useNavigate, useSearchParams } from "react-router-dom";

import { sdk } from "../lib/sdk";
import { FileUpload, FileType, RejectedFile } from "../components/common/file-upload";
import { Form } from "../routes/branding/common/form";

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

    const form = useForm();

    const handleSubmit = form.handleSubmit(async () => {
        // Only save if there's a new file to upload
        if (!uploadedFile) {
            // No changes, just close the drawer
            handleOpenChange(false);
            return;
        }

        setIsSubmitting(true);
        try {
            const currentMetadata = categoryData?.metadata || {};

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

                mutate([`category`, categoryId]);
                toast.success("Category image updated successfully");
                handleOpenChange(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update category image");
        } finally {
            setIsSubmitting(false);
        }
    });

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
                    <Form {...form}>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-1 flex-col overflow-hidden"
                        >
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
                                        maxFileSize={20 * 1024 * 1024} // 20MB
                                        onUploaded={handleFileUpload}
                                    />
                                    {uploadedFile && (
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
                                                onClick={handleRemove}
                                                disabled={isSubmitting}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Drawer.Body>
                            <Drawer.Footer>
                                <div className="flex items-center justify-end gap-x-2">
                                    <Drawer.Close asChild>
                                        <Button size="small" variant="secondary">
                                            Cancel
                                        </Button>
                                    </Drawer.Close>
                                    <Button
                                        size="small"
                                        type="submit"
                                        isLoading={isSubmitting}
                                    >
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

