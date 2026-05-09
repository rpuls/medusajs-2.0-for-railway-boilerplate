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
import { useEffect, useMemo, useState } from "react"

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
import { CohortsChart } from "../../components/reports/cohorts-chart"
import { NewVsReturningChart } from "../../components/reports/new-vs-returning-chart"
import { CartConversionChart } from "../../components/reports/cart-conversion-chart"
import { TimeToPurchaseChart } from "../../components/reports/time-to-purchase-chart"
import { SiteSearchChart } from "../../components/reports/site-search-chart"
import { AcquisitionTab } from "../../components/reports/acquisition-tab"
import { FunnelChart } from "../../components/reports/funnel-chart"
import { RfmChart } from "../../components/reports/rfm-chart"
import { AovBySourceChart } from "../../components/reports/aov-by-source-chart"
import { SlaBreachChart } from "../../components/reports/sla-breach-chart"
import { AgingInventoryChart } from "../../components/reports/aging-inventory-chart"
import { VectorizationFunnelChart } from "../../components/reports/vectorization-funnel-chart"
import { DiscountProfitabilityChart } from "../../components/reports/discount-profitability-chart"
import { ReturnsChart } from "../../components/reports/returns-chart"
import { CustomizerFunnelChart } from "../../components/reports/customizer-funnel-chart"
import { SavedDesignConversionChart } from "../../components/reports/saved-design-conversion-chart"
import { ChurnQueueChart } from "../../components/reports/churn-queue-chart"
import { EmailChannelRoiChart } from "../../components/reports/email-channel-roi-chart"
import { AnnotationsManager } from "../../components/reports/annotations-manager"
import { OperationalTiles } from "../../components/reports/operational-tiles"
import { ReprintRateChart } from "../../components/reports/reprint-rate-chart"
import { CapacityChart } from "../../components/reports/capacity-chart"
import { AlertsManager } from "../../components/reports/alerts-manager"
import { BlanksForecastChart } from "../../components/reports/blanks-forecast-chart"
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

type Region = { id: string; name: string; currency_code: string | null }

const ALL_REGIONS_VALUE = "__all__"

const ReportsPage = () => {
  const [preset, setPreset] = useState<DateRangePreset>("last_30_days")
  const [regions, setRegions] = useState<Region[]>([])
  const [regionId, setRegionId] = useState<string>(ALL_REGIONS_VALUE)

  const range = useMemo(() => buildPreset(preset), [preset])
  const fromIso = useMemo(() => range.from.toISOString(), [range.from])
  const toIso = useMemo(() => range.to.toISOString(), [range.to])
  const activeRegionId = regionId === ALL_REGIONS_VALUE ? null : regionId

  // Fetch regions once on mount.
  useEffect(() => {
    let cancelled = false
    fetch(`/admin/reports/regions`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { regions: [] }))
      .then((j) => {
        if (cancelled) return
        const list = (j?.regions as Region[]) ?? []
        setRegions(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <Container className="flex flex-col gap-y-2">
        <Heading level="h1">Reports</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Trend analysis across SC Prints' core signals: sales, production
          throughput, customer engagement, decoration mix, catalog &
          supply. For "what's stuck right now" see the{" "}
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
        <div className="flex flex-col gap-y-1 min-w-[180px]">
          <Label className="text-xs text-ui-fg-subtle">Region</Label>
          <Select
            value={regionId}
            onValueChange={(v) => setRegionId(v)}
            disabled={regions.length === 0}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={ALL_REGIONS_VALUE}>All regions</Select.Item>
              {regions.map((r) => (
                <Select.Item key={r.id} value={r.id}>
                  {r.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <Text size="xsmall" className="text-ui-fg-muted pb-2">
          {formatDateRange(range)}
          {activeRegionId
            ? ` · ${regions.find((r) => r.id === activeRegionId)?.name ?? activeRegionId}`
            : ""}
        </Text>
      </Container>

      {/* Annotations strip */}
      <AnnotationsManager />

      {/* Operational tiles (storage + Speed Insights link + PostHog link) */}
      <OperationalTiles />

      {/* Threshold alerts manager */}
      <AlertsManager />

      {/* Tabs */}
      <Tabs defaultValue="sales">
        <Container className="p-0">
          <Tabs.List className="px-4 pt-2 flex-wrap">
            <Tabs.Trigger value="sales">Sales overview</Tabs.Trigger>
            <Tabs.Trigger value="acquisition">Acquisition</Tabs.Trigger>
            <Tabs.Trigger value="production">Production</Tabs.Trigger>
            <Tabs.Trigger value="customers">Customers</Tabs.Trigger>
            <Tabs.Trigger value="catalog">Catalog & supply</Tabs.Trigger>
          </Tabs.List>
        </Container>

        <Tabs.Content value="sales">
          <SalesOverviewTab
            fromIso={fromIso}
            toIso={toIso}
            regionId={activeRegionId}
          />
          <div className="grid grid-cols-1 gap-3 mt-3">
            <CartConversionChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <TimeToPurchaseChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <DiscountProfitabilityChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="acquisition">
          <AcquisitionTab fromIso={fromIso} toIso={toIso} />
          <div className="mt-3 grid grid-cols-1 gap-3">
            <AovBySourceChart fromIso={fromIso} toIso={toIso} />
            <EmailChannelRoiChart fromIso={fromIso} toIso={toIso} />
            <FunnelChart fromIso={fromIso} toIso={toIso} />
          </div>
        </Tabs.Content>

        <Tabs.Content value="production">
          <div className="grid grid-cols-1 gap-3">
            <CapacityChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <SlaBreachChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <ReprintRateChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <BlanksForecastChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <TimeInStageChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
              methodCsv={null}
            />
            <AsColourThroughputChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <AovByMethodChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <VectorizationFunnelChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <ReturnsChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="customers">
          <div className="grid grid-cols-1 gap-3">
            <RfmChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <ChurnQueueChart />
            <NewVsReturningChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <CohortsChart regionId={activeRegionId} />
            <CustomizerAdoptionChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <CustomizerFunnelChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <ReorderRateChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <TopCustomersChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <DesignsUtilizationChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <SavedDesignConversionChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="catalog">
          <div className="grid grid-cols-1 gap-3">
            <TopProductsChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <DecorationMixChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <SupplierMixChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <SiteSearchChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <InventoryStatusChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
            <AgingInventoryChart
              fromIso={fromIso}
              toIso={toIso}
              regionId={activeRegionId}
            />
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
