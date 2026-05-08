import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import { Metadata } from "next"
import Link from "next/link"

import GameRotation from "@modules/common/components/games/game-rotation"
import MainStoreShell from "@modules/layout/templates/main-store-shell"

import NotFoundBodyBg from "./[countryCode]/(main)/not-found-body-bg"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

const HEADER_NAVY = "#1a1a2e"

export default function NotFound() {
  return (
    <MainStoreShell>
      {/** SSR-time body bg override + JS body styler + fixed backdrop — three
       * layers ensuring the page is the same navy as the header. Scoped to
       * the 404 page only (style tag and effect both clean up on unmount). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `body, html { background-color: ${HEADER_NAVY} !important; }`,
        }}
      />
      <NotFoundBodyBg />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ backgroundColor: HEADER_NAVY, zIndex: -1 }}
      />
      <div
        className="-mx-[calc(50vw-50%)] flex w-screen flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-4 pb-10 pt-10 text-white"
        style={{ backgroundColor: HEADER_NAVY }}
      >
        <h1 className="text-2xl-semi text-white text-center max-w-lg">
          Page not found&hellip; But maybe you&rsquo;ve found something else
        </h1>
        <p className="text-small-regular text-white/80 text-center">
          The page you tried to access does not exist.
        </p>
        <Link className="flex gap-x-1 items-center group" href="/">
          <Text className="text-white">Go to frontpage</Text>
          <ArrowUpRightMini
            className="group-hover:rotate-45 ease-in-out duration-150 text-white"
          />
        </Link>
        <GameRotation />
      </div>
    </MainStoreShell>
  )
}
