import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles } from "@medusajs/icons"
import { Container, Tabs } from "@medusajs/ui"
import { useState } from "react"

import StudioPage from "../studio/page"
import LookbookPage from "../lookbook/page"

const StudioAndLookbookPage = () => {
  const [activeTab, setActiveTab] = useState<"studio" | "lookbook">("studio")

  return (
    <Container className="p-0">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "studio" | "lookbook")}>
        <div className="px-6 pt-4 border-b border-ui-border-base">
          <Tabs.List>
            <Tabs.Trigger value="studio">Studio</Tabs.Trigger>
            <Tabs.Trigger value="lookbook">Lookbook</Tabs.Trigger>
          </Tabs.List>
        </div>

        <Tabs.Content value="studio" className="p-0">
          <StudioPage />
        </Tabs.Content>

        <Tabs.Content value="lookbook" className="p-0">
          <LookbookPage />
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Studio & Lookbook",
  icon: Sparkles,
})

export default StudioAndLookbookPage
