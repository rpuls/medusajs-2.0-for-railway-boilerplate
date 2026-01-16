import { defineRouteConfig } from "@medusajs/admin-sdk";
import { BuildingStorefront } from "@medusajs/icons";
import { Container } from "@medusajs/ui";
import useSWR from "swr";
import { useSearchParams } from "react-router-dom";

import { brandingFetcher } from "../../lib/sdk";
import { BrandingGeneralSection } from "./components/branding-general-section";
import { BrandingLogosSection } from "./components/branding-logos-section";
import { BrandingContactSection } from "./components/branding-contact-section";
import { BrandingSocialSection } from "./components/branding-social-section";
import { BrandingSeoSection } from "./components/branding-seo-section";
import { BrandingCarouselSection } from "./components/branding-carousel-section";

// Edit drawer components
import {
  EditGeneralDrawer,
  EditLogosDrawer,
  EditContactDrawer,
  EditSocialDrawer,
  EditSeoDrawer,
  EditCarouselDrawer,
} from "./drawers";

const BrandingPage = () => {
  const { data, error, isLoading } = useSWR("branding", brandingFetcher);
  const [searchParams] = useSearchParams();

  // Determine which drawer to show based on URL search params
  const editSection = searchParams.get("edit");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-3">
        <Container className="divide-y p-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex flex-col">
              <div className="bg-ui-bg-component h-4 w-32 animate-pulse rounded" />
              <div className="bg-ui-bg-component mt-2 h-3 w-48 animate-pulse rounded" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    throw error;
  }

  const branding = data?.branding;

  return (
    <div className="flex flex-col gap-y-3">
      <BrandingGeneralSection branding={branding} />
      <BrandingLogosSection branding={branding} />
      <BrandingContactSection branding={branding} />
      <BrandingSocialSection branding={branding} />
      <BrandingSeoSection branding={branding} />
      <BrandingCarouselSection branding={branding} />

      {/* Render drawers based on ?edit= query param */}
      {editSection === "general" && <EditGeneralDrawer />}
      {editSection === "logos" && <EditLogosDrawer />}
      {editSection === "contact" && <EditContactDrawer />}
      {editSection === "social" && <EditSocialDrawer />}
      {editSection === "seo" && <EditSeoDrawer />}
      {editSection === "carousel" && <EditCarouselDrawer />}
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Branding",
  icon: BuildingStorefront,
});

export default BrandingPage;
