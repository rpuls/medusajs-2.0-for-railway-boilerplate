import Script from "next/script"

import ChatIdentifier from "./chat-identifier"

/**
 * Live chat widget. Supports two providers:
 *   - NEXT_PUBLIC_CRISP_WEBSITE_ID (Crisp)
 *   - NEXT_PUBLIC_TIDIO_PUBLIC_KEY (Tidio)
 *
 * Whichever is set first (Crisp takes priority) renders. If neither is
 * set the component returns null — devs and previews stay quiet.
 *
 * Sign-in identification is handled by `<ChatIdentifier />`, a client
 * component that picks up the logged-in customer from cookies and
 * passes name/email to the widget once it loads.
 */
export const ChatWidget = () => {
  const crispId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
  const tidioKey = process.env.NEXT_PUBLIC_TIDIO_PUBLIC_KEY

  if (crispId) {
    return (
      <>
        <Script id="crisp-init" strategy="afterInteractive">
          {`
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="${crispId}";
            (function(){
              const d=document; const s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `}
        </Script>
        <ChatIdentifier provider="crisp" />
      </>
    )
  }

  if (tidioKey) {
    return (
      <>
        <Script
          src={`//code.tidio.co/${tidioKey}.js`}
          strategy="afterInteractive"
        />
        <ChatIdentifier provider="tidio" />
      </>
    )
  }

  return null
}
