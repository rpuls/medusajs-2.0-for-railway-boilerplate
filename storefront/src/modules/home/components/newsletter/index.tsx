"use client"

import { useState } from "react"
import { useTranslation } from "@lib/i18n/hooks/use-translation"

const Newsletter = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [allowMarketing, setAllowMarketing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter subscription API call
    console.log("Subscribe:", { email, allowMarketing })
    setIsSubscribed(true)
    setEmail("")
  }

  return (
    <div className="content-container py-8 md:py-12">
      <div className="bg-background-elevated rounded-3xl p-6 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
            {/* Icon and Text */}
            <div className="flex items-start gap-4 md:gap-6 flex-1">
              <div className="flex-shrink-0 text-primary">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-text-primary mb-2">
                  {t("homepage.newsletter.title")}
                </h3>
                <p className="text-sm md:text-base text-text-secondary">
                  {t("homepage.newsletter.description")}
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="w-full md:w-auto md:flex-1 flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("homepage.newsletter.placeholder")}
                  required
                  className="flex-1 px-4 py-3 rounded-full border-2 border-border-base focus:border-primary focus:outline-none text-text-primary placeholder:text-text-tertiary bg-background-base"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-text-inverse rounded-full hover:bg-primary-hover transition-colors font-medium whitespace-nowrap"
                >
                  {t("homepage.newsletter.button")}
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowMarketing}
                  onChange={(e) => setAllowMarketing(e.target.checked)}
                  className="w-4 h-4 rounded border-border-base text-primary focus:ring-primary"
                />
                <span className="text-xs md:text-sm text-text-secondary">
                  {t("homepage.newsletter.marketingConsent")}
                </span>
              </label>
              {isSubscribed && (
                <p className="text-sm text-success">
                  {t("homepage.newsletter.success")}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Newsletter

