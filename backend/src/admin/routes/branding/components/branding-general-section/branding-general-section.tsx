import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig } from "../../../../lib/types";

type BrandingGeneralSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingGeneralSection = ({
  branding,
}: BrandingGeneralSectionProps) => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>General Settings</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Manage your site's basic branding information
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  to: "?edit=general",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Site Title
        </Text>
        <Text size="small" leading="compact">
          {branding?.site_title || "-"}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Copyright Text
        </Text>
        <Text size="small" leading="compact">
          {branding?.copyright_text || "-"}
        </Text>
      </div>
    </Container>
  );
};

