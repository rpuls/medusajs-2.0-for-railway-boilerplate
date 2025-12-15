import Script from "next/script"
import { WithContext } from "schema-dts"

type JsonLdScriptProps = {
  id: string
  data: WithContext<any>
}

/**
 * Component to inject JSON-LD structured data
 * Uses Next.js Script component for optimal loading
 */
export default function JsonLdScript({ id, data }: JsonLdScriptProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}


