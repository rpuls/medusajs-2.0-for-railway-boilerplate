import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"
import GameRotation from "@modules/common/components/games/game-rotation"

import NotFoundBodyBg from "./not-found-body-bg"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

/** Header colour — same value `bg-ui-fg-base` resolves to (`--brand-primary` /
 * Inkwell Navy from `globals.css`). Inlined as a hex literal so this page is
 * not at the mercy of Tailwind class generation, CSS load order, or globals
 * cascade — the browser renders the colour we ask for. */
const HEADER_NAVY = "#1a1a2e"

export default function NotFound() {
  return (
    <>
      {/** SSR-time body bg override — present in the initial HTML so first
       * paint is already navy (no light flash before hydration). The `<style>`
       * tag is only in the DOM while THIS page is rendered, so other pages
       * are unaffected. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `body, html { background-color: ${HEADER_NAVY} !important; }`,
        }}
      />
      {/** Hydration-time enforcer — uses JS inline styles with `!important`
       * to keep body bg navy even if the cascade later finds something to
       * override the SSR rule. Cleans up on unmount so other pages revert. */}
      <NotFoundBodyBg />
      {/** Fixed full-viewport backdrop covering the whole page at the lowest
       * layer — final guarantee something covers the body if all else fails. */}
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
        <InteractiveLink href="/">Go to frontpage</InteractiveLink>
        <GameRotation />
      </div>
    </>
  )
}
