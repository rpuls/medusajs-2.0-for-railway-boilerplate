import { getTranslations, getTranslation } from "@lib/i18n/server"

interface AdvantageBox {
  icon: React.ReactNode
  title: string
  description?: string
}

interface AdvantageBoxesProps {
  advantages?: AdvantageBox[]
  countryCode?: string
}

const AdvantageBoxes = async ({ 
  advantages, 
  countryCode = "us" 
}: AdvantageBoxesProps) => {
  // Get translations
  const translations = await getTranslations(countryCode)
  
  // Build advantages from translations if not provided
  const defaultAdvantages: AdvantageBox[] = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
      title: getTranslation(translations, "homepage.advantages.freeShipping.title"),
      description: getTranslation(translations, "homepage.advantages.freeShipping.description"),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: getTranslation(translations, "homepage.advantages.fastDelivery.title"),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: getTranslation(translations, "homepage.advantages.securePurchase.title"),
    },
  ]

  const displayAdvantages = advantages || defaultAdvantages
  return (
    <div className="content-container py-8 md:py-12">
      <div className="bg-background-elevated rounded-3xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {displayAdvantages.map((advantage, index) => (
            <div
              key={index}
              className="flex items-start gap-4 md:gap-6"
            >
              <div className="flex-shrink-0 text-primary">
                {advantage.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-text-primary mb-1">
                  {advantage.title}
                </h3>
                {advantage.description && (
                  <p className="text-sm md:text-base text-text-secondary">
                    {advantage.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdvantageBoxes

