import { Container, Heading, Text } from "@medusajs/ui"
import { TwoColumnPage } from "../../../components/layout/pages"
import { useTranslation } from "react-i18next"
import {
  useStore,
  useTranslationSettings,
  useTranslationStatistics,
} from "../../../hooks/api"
import { ActiveLocalesSection } from "./components/active-locales-section/active-locales-section"
import { TranslationListSection } from "./components/translation-list-section/translation-list-section"
import { TranslationsCompletionSection } from "./components/translations-completion-section/translations-completion-section"
import { TwoColumnPageSkeleton } from "../../../components/common/skeleton"
import { useMemo } from "react"

export type TranslatableEntity = {
  label: string
  reference: string
  translatableFields: string[]
  translatedCount?: number
  totalCount?: number
}

export const TranslationList = () => {
  const { t } = useTranslation()

  const { store, isPending, isError, error } = useStore()
  const {
    translatable_fields,
    isPending: isTranslationSettingsPending,
    isError: isTranslationSettingsError,
    error: translationSettingsError,
  } = useTranslationSettings()
  const {
    statistics,
    isPending: isTranslationStatisticsPending,
    isError: isTranslationStatisticsError,
    error: translationStatisticsError,
  } = useTranslationStatistics(
    {
      locales:
        store?.supported_locales?.map(
          (suportedLocale) => suportedLocale.locale_code
        ) ?? [],
      entity_types: Object.keys(translatable_fields ?? {}),
    },
    {
      enabled:
        !!translatable_fields && !!store && store.supported_locales?.length > 0,
    }
  )

  if (isError || isTranslationSettingsError || isTranslationStatisticsError) {
    throw error || translationSettingsError || translationStatisticsError
  }

  const hasLocales = (store?.supported_locales ?? []).length > 0

  const translatableEntities: TranslatableEntity[] = useMemo(() => {
    if (!translatable_fields) {
      return []
    }

    return Object.entries(translatable_fields)
      .filter(
        ([entity]) =>
          !["product_option", "product_option_value"].includes(entity)
      )
      .map(([entity, fields]) => {
        const entityStatistics = statistics?.[entity] ?? {
          translated: 0,
          expected: 0,
        }

        return {
          label: entity
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          reference: entity,
          translatableFields: fields,
          translatedCount: entityStatistics.translated,
          totalCount: entityStatistics.expected,
        }
      })
  }, [translatable_fields, statistics])

  const isReady =
    !!store &&
    !isPending &&
    !isTranslationSettingsPending &&
    !!translatable_fields &&
    ((!!statistics && !isTranslationStatisticsPending) || !hasLocales)

  if (!isReady) {
    return <TwoColumnPageSkeleton sidebarSections={2} />
  }

  return (
    <TwoColumnPage
      widgets={{
        before: [],
        after: [],
        sideBefore: [],
        sideAfter: [],
      }}
    >
      <TwoColumnPage.Main>
        <Container className="flex flex-col px-6 py-4">
          <Heading>Manage {t("translations.domain")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("translations.subtitle")}
          </Text>
        </Container>
        <TranslationListSection
          entities={translatableEntities}
          hasLocales={hasLocales}
        />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <ActiveLocalesSection
          locales={
            store?.supported_locales?.map(
              (suportedLocale) => suportedLocale.locale
            ) ?? []
          }
        ></ActiveLocalesSection>
        <TranslationsCompletionSection
          statistics={statistics ?? {}}
          locales={
            store?.supported_locales?.map(
              (supportedLocale) => supportedLocale.locale
            ) ?? []
          }
        />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  )
}
