import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Heading,
  Input,
  Textarea,
  IconButton,
  toast,
  Drawer,
  Text,
} from "@medusajs/ui";
import { Plus, Trash, ArrowUpMini, ArrowDownMini } from "@medusajs/icons";
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse, CarouselSlide } from "../../../lib/types";
import { Form } from "../common/form";
import { FileUpload, FileType } from "../../../components/common/file-upload";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const CarouselSlideSchema = z.object({
  image_url: z.string().url().optional().or(z.literal("")),
  title: z.string().optional(),
  description: z.string().optional(),
  link_url: z.string().url().optional().or(z.literal("")),
  link_text: z.string().optional(),
  order: z.coerce.number().optional(),
});

const EditCarouselSchema = z.object({
  carousel_slides: z.array(CarouselSlideSchema),
});

type EditCarouselFormValues = z.infer<typeof EditCarouselSchema>;

export const EditCarouselDrawer = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Map<number, FileType>>(
    new Map()
  );

  const { data, isLoading } = useSWR<BrandingResponse>(
    "branding",
    brandingFetcher
  );
  const carouselSlides = data?.branding?.carousel_slides as
    | CarouselSlide[]
    | undefined;

  const form = useForm<EditCarouselFormValues>({
    defaultValues: {
      carousel_slides: [],
    },
    resolver: zodResolver(EditCarouselSchema),
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "carousel_slides",
  });

  useEffect(function openDrawer() {
    setOpen(true);
  }, []);

  useEffect(
    function updateFormData() {
      if (
        carouselSlides &&
        carouselSlides.length > 0 &&
        fields.length === 0 &&
        !form.formState.isDirty
      ) {
        form.reset({
          carousel_slides: carouselSlides.map((slide, index) => ({
            ...slide,
            order: slide.order ?? index + 1,
          })),
        });
      }
    },
    [carouselSlides, fields.length, form]
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
      // Upload all files first
      const filesToUpload = Array.from(uploadedFiles.values()).map((f) => f.file);
      let uploadedUrls: string[] = [];
      if (filesToUpload.length > 0) {
        const { files } = await sdk.admin.upload.create({
          files: filesToUpload,
        });
        uploadedUrls = files.map((f) => f.url);
      }

      // Map uploaded files to their indices and create a URL map
      const fileUrlMap = new Map<number, string>();
      let urlIndex = 0;
      uploadedFiles.forEach((file, slideIndex) => {
        fileUrlMap.set(slideIndex, uploadedUrls[urlIndex++]);
      });

      const slides = values.carousel_slides
        .map((slide, index) => {
          // Use uploaded file URL if available, otherwise use manual URL
          const imageUrl = fileUrlMap.get(index) || slide.image_url || undefined;
          return {
            image_url: imageUrl,
            title: slide.title || undefined,
            description: slide.description || undefined,
            link_url: slide.link_url || undefined,
            link_text: slide.link_text || undefined,
            order: index + 1,
          };
        })
        .filter((slide) => slide.image_url || slide.title);

      await sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: {
          carousel_slides: slides.length > 0 ? slides : null,
        },
      });
      await mutate("branding");
      toast.success("Carousel slides updated successfully");
      navigate("/branding", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to update carousel slides");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleFileUpload = (index: number) => (file: FileType) => {
    setUploadedFiles((prev) => {
      const newMap = new Map(prev);
      // Clean up old file URL if exists
      const oldFile = newMap.get(index);
      if (oldFile?.url) {
        URL.revokeObjectURL(oldFile.url);
      }
      newMap.set(index, file);
      return newMap;
    });
  };

  const handleFileRemove = (index: number) => () => {
    setUploadedFiles((prev) => {
      const newMap = new Map(prev);
      const file = newMap.get(index);
      if (file?.url) {
        URL.revokeObjectURL(file.url);
      }
      newMap.delete(index);
      return newMap;
    });
  };

  const handleRemove = (index: number) => {
    // Clean up uploaded file if exists
    handleFileRemove(index)();
    remove(index);
  };

  const handleAddSlide = () => {
    append({
      image_url: "",
      title: "",
      description: "",
      link_url: "",
      link_text: "",
      order: fields.length + 1,
    });
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      // Move uploaded file reference as well
      const fileAtCurrent = uploadedFiles.get(index);
      const fileAtNext = uploadedFiles.get(index + 1);
      setUploadedFiles((prev) => {
        const newMap = new Map(prev);
        if (fileAtCurrent) {
          newMap.set(index + 1, fileAtCurrent);
        } else {
          newMap.delete(index + 1);
        }
        if (fileAtNext) {
          newMap.set(index, fileAtNext);
        } else {
          newMap.delete(index);
        }
        return newMap;
      });
      move(index, index + 1);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      // Move uploaded file reference as well
      const fileAtCurrent = uploadedFiles.get(index);
      const fileAtPrevious = uploadedFiles.get(index - 1);
      setUploadedFiles((prev) => {
        const newMap = new Map(prev);
        if (fileAtCurrent) {
          newMap.set(index - 1, fileAtCurrent);
        } else {
          newMap.delete(index - 1);
        }
        if (fileAtPrevious) {
          newMap.set(index, fileAtPrevious);
        } else {
          newMap.delete(index);
        }
        return newMap;
      });
      move(index, index - 1);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>Edit Carousel Slides</Heading>
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
                    <p className="mb-4">No carousel slides configured</p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleAddSlide}
                    >
                      <Plus />
                      Add Slide
                    </Button>
                  </div>
                ) : (
                  <>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-ui-bg-subtle rounded-lg border p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-ui-fg-subtle text-sm font-medium">
                            Slide {index + 1}
                          </span>
                          <div className="flex items-center gap-x-1">
                            <IconButton
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                            >
                              <ArrowUpMini className="text-ui-fg-subtle" />
                            </IconButton>
                            <IconButton
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === fields.length - 1}
                            >
                              <ArrowDownMini className="text-ui-fg-subtle" />
                            </IconButton>
                            <IconButton
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={() => handleRemove(index)}
                            >
                              <Trash className="text-ui-fg-subtle" />
                            </IconButton>
                          </div>
                        </div>
                        <div className="flex flex-col gap-y-4">
                          <Form.Field
                            control={form.control}
                            name={`carousel_slides.${index}.image_url`}
                            render={({ field }) => (
                              <Form.Item>
                                <Form.Label optional>Image URL</Form.Label>
                                {uploadedFiles.has(index) ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-x-2 p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                                      <img
                                        src={uploadedFiles.get(index)!.url}
                                        alt="Preview"
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <Text size="small" className="text-ui-fg-base truncate">
                                          {uploadedFiles.get(index)!.file.name}
                                        </Text>
                                        <Text size="xsmall" className="text-ui-fg-muted">
                                          {(uploadedFiles.get(index)!.file.size / 1024).toFixed(2)} KB
                                        </Text>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="transparent"
                                        size="small"
                                        onClick={handleFileRemove(index)}
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
                                        placeholder="https://example.com/slide.jpg"
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
                          {!uploadedFiles.has(index) && (
                            <FileUpload
                              label="Upload Image"
                              hint="Drag and drop an image here or click to upload"
                              formats={SUPPORTED_IMAGE_FORMATS}
                              multiple={false}
                              maxFileSize={10 * 1024 * 1024} // 10MB for carousel images
                              onUploaded={(files) => {
                                if (files.length > 0) {
                                  handleFileUpload(index)(files[0]);
                                }
                              }}
                            />
                          )}
                          <Form.Field
                            control={form.control}
                            name={`carousel_slides.${index}.title`}
                            render={({ field }) => (
                              <Form.Item>
                                <Form.Label optional>Title</Form.Label>
                                <Form.Control>
                                  <Input placeholder="Slide title" {...field} />
                                </Form.Control>
                                <Form.ErrorMessage />
                              </Form.Item>
                            )}
                          />
                          <Form.Field
                            control={form.control}
                            name={`carousel_slides.${index}.description`}
                            render={({ field }) => (
                              <Form.Item>
                                <Form.Label optional>Description</Form.Label>
                                <Form.Control>
                                  <Textarea
                                    placeholder="Slide description"
                                    rows={2}
                                    {...field}
                                  />
                                </Form.Control>
                                <Form.ErrorMessage />
                              </Form.Item>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Form.Field
                              control={form.control}
                              name={`carousel_slides.${index}.link_url`}
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Label optional>Link URL</Form.Label>
                                  <Form.Control>
                                    <Input
                                      placeholder="https://example.com/page"
                                      {...field}
                                    />
                                  </Form.Control>
                                  <Form.ErrorMessage />
                                </Form.Item>
                              )}
                            />
                            <Form.Field
                              control={form.control}
                              name={`carousel_slides.${index}.link_text`}
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Label optional>Link Text</Form.Label>
                                  <Form.Control>
                                    <Input placeholder="Shop Now" {...field} />
                                  </Form.Control>
                                  <Form.ErrorMessage />
                                </Form.Item>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleAddSlide}
                      className="self-start shrink-0"
                    >
                      <Plus />
                      Add Slide
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
