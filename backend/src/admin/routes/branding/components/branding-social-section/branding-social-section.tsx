import { PencilSquare } from "@medusajs/icons";
import { Badge, Container, Heading, Text } from "@medusajs/ui";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig, SocialLink } from "../../../../lib/types";

type BrandingSocialSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingSocialSection = ({
  branding,
}: BrandingSocialSectionProps) => {
  const socialLinks = branding?.social_links as SocialLink[] | undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Social Links</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Manage your social media links
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  to: "?edit=social",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="px-6 py-4">
        {socialLinks && socialLinks.length > 0 ? (
          <div className="flex flex-col gap-y-3">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-x-3">
                <Badge size="small" className="capitalize">
                  {link.platform}
                </Badge>
                <Text size="small" leading="compact" className="text-ui-fg-subtle truncate">
                  {link.url}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            No social links configured
          </Text>
        )}
      </div>
    </Container>
  );
};


