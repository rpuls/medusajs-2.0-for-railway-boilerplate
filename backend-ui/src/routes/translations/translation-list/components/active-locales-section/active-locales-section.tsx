import { PencilSquare, Language } from "@medusajs/icons"
import {
  Container,
  Heading,
  IconButton,
  InlineTip,
  Text,
  Tooltip,
} from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { IconAvatar } from "../../../../../components/common/icon-avatar"
import { HttpTypes } from "@medusajs/types"
import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

type ActiveLocalesSectionProps = {
  locales: HttpTypes.AdminLocale[]
}

export const ActiveLocalesSection = ({
  locales,
}: ActiveLocalesSectionProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const handleManageLocales = useCallback(() => {
    navigate("/settings/translations/add-locales")
  }, [navigate])

  const renderLocales = useCallback(() => {
    const maxLocalesToDetail = 2
    if (locales.length <= maxLocalesToDetail) {
      return locales.map((locale) => locale.name).join(", ")
    }

    return `${locales
      .slice(0, maxLocalesToDetail)
      .map((locale) => locale.name)
      .join(", ")} + ${locales.length - maxLocalesToDetail}`
  }, [locales])

  const hasLocales = locales.length > 0

  return (
    <Container className="flex flex-col p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("translations.activeLocales.heading")}</Heading>
        <IconButton variant="transparent" onClick={handleManageLocales}>
          <PencilSquare></PencilSquare>
        </IconButton>
      </div>
      <div className="px-1 pb-1">
        {hasLocales ? (
          <Tooltip
            open={isHovered}
            content={
              <div className="flex flex-col gap-y-1 p-1">
                {locales.map((locale) => (
                  <Text key={locale.code} size="small" weight="plus">
                    {locale.name}
                  </Text>
                ))}
              </div>
            }
          >
            <Container
              className="bg-ui-bg-component border-r-1 flex items-center gap-x-4 px-[19px] py-2"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <IconAvatar className="border-ui-border-base border">
                <Language />
              </IconAvatar>
              <div className="flex flex-col">
                <Text size="small" weight="plus">
                  {t("translations.activeLocales.subtitle")}
                </Text>
                <Text className="text-ui-fg-subtle" size="small">
                  {renderLocales()}
                </Text>
              </div>
            </Container>
          </Tooltip>
        ) : (
          <InlineTip label="Tip">
            {t("translations.activeLocales.noLocalesTip")}
          </InlineTip>
        )}
      </div>
    </Container>
  )
}
