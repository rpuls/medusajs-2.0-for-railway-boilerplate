import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Label,
  Select,
  Tabs,
  Text,
} from "@medusajs/ui"
import { ChartBar } from "@medusajs/icons"
import { useMemo, useState } from "react"

import { TimeInStageChart } from "../../components/reports/time-in-stage-chart"
import { CustomizerAdoptionChart } from "../../components/reports/customizer-adoption-chart"
import { DecorationMixChart } from "../../components/reports/decoration-mix-chart"
import { ReorderRateChart } from "../../components/reports/reorder-rate-chart"
import { SalesOverviewTab } from "../../components/reports/sales-overview-tab"
import { TopCustomersChart } from "../../components/reports/top-customers-chart"
import { AsColourThroughputChart } from "../../components/reports/ascolour-throughput-chart"
import { AovByMethodChart } from "../../components/reports/aov-by-method-chart"
import { SupplierMixChart } from "../../components/reports/supplier-mix-chart"
import { DesignsUtilizationChart } from "../../components/reports/designs-utilization-chart"
import { TopProductsChart } from "../../components/reports/top-products-chart"
import { InventoryStatusChart } from "../../components/reports/inventory-status-chart"
import {
  buildPreset,
  formatDateRange,
  PRESET_LABELS,
  type DateRangePreset,
} from "../../lib/reports/date-range"

const PRESETS: DateRangePreset[] = [
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_month",
  "last_quarter",
]

const ReportsPage = () => {
  const [preset, setPreset] = useState<DateRangePreset>("last_30_days")

  const range = useMemo(() => buildPreset(preset), [preset])
  const fromIso = useMemo(() => range.from.toISOString(), [range.from])
  const toIso = useMemo(() => range.to.toISOString(), [range.to])

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <Container className="flex flex-col gap-y-2">
        <Heading level="h1">Reports</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Trend analysis across SC Prints' core signals: sales, production
          throughput, customer engagement, decoration mix, and supply
          chain. For "what's stuck right now" see the{" "}
          <a className="underline" href="/app/production">
            Production
          </a>{" "}
          page.
        </Text>
      </Container>

      {/* Filter bar */}
      <Container className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-y-1 min-w-[180px]">
          <Label className="text-xs text-ui-fg-subtle">Date range</Label>
          <Select
            value={preset}
            onValueChange={(v) => setPreset(v as DateRangePreset)}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {PRESETS.map((p) => (
                <Select.Item key={p} value={p}>
                  {PRESET_LABELS[p]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <Text size="xsmall" className="text-ui-fg-muted pb-2">
          {formatDateRange(range)}
        </Text>
      </Container>

      {/* Tabs */}
      <Tabs defaultValue="sales">
        <Container className="p-0">
          <Tabs.List className="px-4 pt-2 flex-wrap">
            <Tabs.Trigger value="sales">Sales overview</Tabs.Trigger>
            <Tabs.Trigger value="production">Production</Tabs.Trigger>
            <Tabs.Trigger value="customers">Customers</Tabs.Trigger>
            <Tabs.Trigger value="catalog">Catalog & supply</Tabs.Trigger>
          </Tabs.List>
        </Container>

        <Tabs.Content value="sales">
          <SalesOverviewTab fromIso={fromIso} toIso={toIso} />
        </Tabs.Content>

        <Tabs.Content value="production">
          <div className="grid grid-cols-1 gap-3">
            <TimeInStageChart fromIso={fromIso} toIso={toIso} methodCsv={null} />
            <AsColourThroughputChart fromIso={fromIso} toIso={toIso} />
            <AovByMethodChart fromIso={fromIso} toIso={toIso} />
          </div>
        </Tabs.Content>

        <Tabs.Content value="customers">
          <div className="grid grid-cols-1 gap-3">
            <CustomizerAdoptionChart fromIso={fromIso} toIso={toIso} />
            <ReorderRateChart fromIso={fromIso} toIso={toIso} />
            <TopCustomersChart fromIso={fromIso} toIso={toIso} />
            <DesignsUtilizationChart fromIso={fromIso} toIso={toIso} />
          </div>
        </Tabs.Content>

        <Tabs.Content value="catalog">
          <div className="grid grid-cols-1 gap-3">
            <TopProductsChart fromIso={fromIso} toIso={toIso} />
            <DecorationMixChart fromIso={fromIso} toIso={toIso} />
            <SupplierMixChart fromIso={fromIso} toIso={toIso} />
            <InventoryStatusChart fromIso={fromIso} toIso={toIso} />
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Reports",
  icon: ChartBar,
})

export default ReportsPage
