import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig, CarouselSlide } from "../../../../lib/types";

type BrandingCarouselSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingCarouselSection = ({
  branding,
}: BrandingCarouselSectionProps) => {
  const carouselSlides = branding?.carousel_slides as CarouselSlide[] | undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Carousel Slides</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Manage homepage carousel slides
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  to: "?edit=carousel",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="px-6 py-4">
        {carouselSlides && carouselSlides.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {carouselSlides
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((slide, index) => (
                <div
                  key={index}
                  className="bg-ui-bg-subtle overflow-hidden rounded-lg border"
                >
                  {slide.image_url ? (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={slide.image_url}
                        alt={slide.title || `Slide ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-ui-bg-component aspect-video flex items-center justify-center">
                      <Text size="small" className="text-ui-fg-muted">
                        No image
                      </Text>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-x-2">
                      <Text size="xsmall" className="text-ui-fg-muted">
                        #{slide.order || index + 1}
                      </Text>
                      <Text size="small" weight="plus" className="truncate">
                        {slide.title || "-"}
                      </Text>
                    </div>
                    {slide.description && (
                      <Text
                        size="xsmall"
                        className="text-ui-fg-subtle mt-1 line-clamp-2"
                      >
                        {slide.description}
                      </Text>
                    )}
                    {slide.link_url && (
                      <Text
                        size="xsmall"
                        className="text-ui-fg-interactive mt-2 truncate"
                      >
                        {slide.link_text || slide.link_url}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            No carousel slides configured
          </Text>
        )}
      </div>
    </Container>
  );
};


