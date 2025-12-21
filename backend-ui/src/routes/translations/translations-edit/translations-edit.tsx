import { useNavigate, useSearchParams } from "react-router-dom"
import {
  useReferenceTranslations,
  useStore,
  useTranslationSettings,
} from "../../../hooks/api"
import { TranslationsEditForm } from "./components/translations-edit-form"
import { useEffect } from "react"
import { RouteFocusModal } from "../../../components/modals"
import { useFeatureFlag } from "../../../providers/feature-flag-provider"
import { keepPreviousData } from "@tanstack/react-query"

export const TranslationsEdit = () => {
  const isTranslationsEnabled = useFeatureFlag("translation")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reference = searchParams.get("reference")
  const referenceIdParam = searchParams.getAll("reference_id")

  useEffect(() => {
    if (!reference || !isTranslationsEnabled) {
      navigate(-1)
      return
    }
  }, [reference, navigate, isTranslationsEnabled])

  const {
    translatable_fields,
    isPending: isTranslationSettingsPending,
    isError: isTranslationSettingsError,
    error: translationSettingsError,
  } = useTranslationSettings({ entity_type: reference! })

  const {
    translations,
    references,
    fetchNextPage,
    count,
    isFetchingNextPage,
    hasNextPage,
    isPending,
    isError,
    error,
  } = useReferenceTranslations(
    reference!,
    translatable_fields?.[reference!] ?? [],
    referenceIdParam,
    {
      enabled: !!translatable_fields && !!reference,
      placeholderData: keepPreviousData,
    }
  )
  const {
    store,
    isPending: isStorePending,
    isError: isStoreError,
    error: storeError,
  } = useStore()

  const ready =
    !isPending &&
    !!translations &&
    !!translatable_fields &&
    !isTranslationSettingsPending &&
    !!references &&
    !isStorePending &&
    !!store

  if (isError || isStoreError || isTranslationSettingsError) {
    throw error || storeError || translationSettingsError
  }

  return (
    <RouteFocusModal prev={referenceIdParam.length ? -1 : ".."}>
      {ready && (
        <TranslationsEditForm
          translations={translations}
          references={references}
          entityType={reference!}
          availableLocales={store?.supported_locales ?? []}
          translatableFields={translatable_fields[reference!]}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          referenceCount={count}
        />
      )}
    </RouteFocusModal>
  )
}
