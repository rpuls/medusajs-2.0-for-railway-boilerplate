import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig, Logos } from "../../../../lib/types";

type BrandingLogosSectionProps = {
  branding?: BrandingConfig;
};

const LogoDisplay = ({
  logo,
  label,
}: {
  logo?: { url: string; alt: string; width: number; height: number };
  label: string;
}) => (
  <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
    <Text size="small" leading="compact" weight="plus">
      {label}
    </Text>
    {logo?.url ? (
      <div className="flex items-center gap-x-3">
        <div className="bg-ui-bg-component flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border">
          <img
            src={logo.url}
            alt={logo.alt || label}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <Text size="small" leading="compact">
            {logo.width}x{logo.height}px
          </Text>
          <Text size="xsmall" leading="compact" className="text-ui-fg-muted">
            {logo.alt || "-"}
          </Text>
        </div>
      </div>
    ) : (
      <Text size="small" leading="compact">
        -
      </Text>
    )}
  </div>
);

export const BrandingLogosSection = ({
  branding,
}: BrandingLogosSectionProps) => {
  const logos = branding?.logos as Logos | undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Logos</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Manage your site logos
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  to: "?edit=logos",
                },
              ],
            },
          ]}
        />
      </div>
      <LogoDisplay logo={logos?.main} label="Main Logo" />
      <LogoDisplay logo={logos?.footer} label="Footer Logo" />
      <LogoDisplay logo={logos?.favicon} label="Favicon" />
    </Container>
  );
};
