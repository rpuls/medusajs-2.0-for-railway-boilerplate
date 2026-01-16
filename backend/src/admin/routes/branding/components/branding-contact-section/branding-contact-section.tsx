import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig, ContactInfo } from "../../../../lib/types";

type BrandingContactSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingContactSection = ({
  branding,
}: BrandingContactSectionProps) => {
  const contactInfo = branding?.contact_info as ContactInfo | undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Contact Information</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Manage contact details displayed on your site
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  to: "?edit=contact",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Email
        </Text>
        <Text size="small" leading="compact">
          {contactInfo?.email || "-"}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Phone
        </Text>
        <Text size="small" leading="compact">
          {contactInfo?.phone || "-"}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Address
        </Text>
        <Text size="small" leading="compact" className="whitespace-pre-line">
          {contactInfo?.address || "-"}
        </Text>
      </div>
    </Container>
  );
};


