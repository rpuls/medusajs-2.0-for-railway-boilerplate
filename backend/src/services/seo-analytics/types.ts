export type SeoSummaryStatus = "ok" | "partial" | "error" | "empty"

export type GscRow = {
  key: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export type GscByDay = {
  date: string
  clicks: number
  impressions: number
}

export type GscSummary = {
  totals: {
    clicks: number
    impressions: number
    ctr: number
    position: number
  }
  topQueries: GscRow[]
  topPages: GscRow[]
  byDay: GscByDay[]
}

export type Ga4PageRow = {
  path: string
  sessions: number
  conversions: number
}

export type Ga4ByDay = {
  date: string
  sessions: number
}

export type Ga4Summary = {
  totals: {
    sessions: number
    conversions: number
    engagedSessions: number
    averageSessionDuration: number
  }
  topPages: Ga4PageRow[]
  byDay: Ga4ByDay[]
}

export type SeoSourceFailure = {
  source: "gsc" | "ga4"
  message: string
}

export type SeoSummary = {
  status: SeoSummaryStatus
  generated_at: string
  range: { days: number; start: string; end: string }
  gsc: GscSummary | null
  ga4: Ga4Summary | null
  errors: SeoSourceFailure[]
}
