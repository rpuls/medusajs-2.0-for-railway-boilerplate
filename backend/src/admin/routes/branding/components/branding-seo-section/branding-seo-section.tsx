import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig, SeoDefaults } from "../../../../lib/types";

type BrandingSeoSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingSeoSection = ({
  branding,
}: BrandingSeoSectionProps) => {
  const seoDefaults = branding?.seo_defaults as SeoDefaults | undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>SEO Defaults</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Configure default SEO settings for your site
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  to: "?edit=seo",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Site Tagline
        </Text>
        <Text size="small" leading="compact">
          {seoDefaults?.site_tagline || "-"}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Meta Description Template
        </Text>
        <Text size="small" leading="compact" className="whitespace-pre-line">
          {seoDefaults?.meta_description_template || "-"}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Default OG Image
        </Text>
        {seoDefaults?.default_og_image_url ? (
          <div className="flex items-center gap-x-3">
            <div className="bg-ui-bg-component flex h-10 w-16 items-center justify-center overflow-hidden rounded-md border">
              <img
                src={seoDefaults.default_og_image_url}
                alt="Default OG Image"
                className="h-full w-full object-cover"
              />
            </div>
            <Text size="xsmall" leading="compact" className="text-ui-fg-muted truncate max-w-[200px]">
              {seoDefaults.default_og_image_url}
            </Text>
          </div>
        ) : (
          <Text size="small" leading="compact">
            -
          </Text>
        )}
      </div>
    </Container>
  );
};


