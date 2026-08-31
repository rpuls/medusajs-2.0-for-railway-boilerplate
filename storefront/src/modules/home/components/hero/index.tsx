import { ArrowUpRightMini, LightBulb } from "@medusajs/icons"
import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NextSteps from "./next-steps"

/**
 * Placeholder homepage hero.
 *
 * This is example content, not a finished storefront, and it says so: the
 * dashed outline and the label mark it as a component to replace. It stays
 * useful in the meantime by greeting visitors, sending them into the catalogue
 * and pointing at the guide that covers swapping it out.
 *
 * Deleting it is a two line change: drop <Hero /> from
 * src/app/[countryCode]/(main)/page.tsx and delete this folder.
 */

const TUTORIAL_URL =
  "https://funkyton.com/medusajs-2-0-is-finally-here/#succuessfully-deployed-whats-next"

const REPO_SLUG = "rpuls/medusajs-2.0-for-railway-boilerplate"
const REPO_URL = `https://github.com/${REPO_SLUG}`

/* ==========================================================================
 * EXAMPLE SECTION START
 *
 * Everything from here to EXAMPLE SECTION END is placeholder content. It is
 * meant to be deleted once you build your own homepage.
 *
 * To remove it completely:
 *   1. open src/app/[countryCode]/(main)/page.tsx and delete the <Hero />
 *      line, plus its import at the top of that file
 *   2. delete this whole folder: src/modules/home/components/hero
 *
 * Nothing else depends on it. The rest of the storefront keeps working.
 * ========================================================================== */

const Hero = () => {
  return (
    <div className="w-full bg-ui-bg-base py-8 small:py-12">
      <div className="content-container">
        <section
          data-testid="hero"
          aria-label="Example section"
          className="rounded-lg border-2 border-dashed border-ui-border-strong bg-ui-bg-subtle"
        >
          <div className="flex flex-wrap items-center gap-x-2 border-b-2 border-dashed border-ui-border-strong px-6 py-3">
            <LightBulb className="text-ui-fg-muted shrink-0" />
            <Text
              size="small"
              leading="compact"
              className="text-ui-fg-subtle uppercase tracking-wider"
              data-testid="hero-example-label"
            >
              Example section
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-muted">
              built to be replaced with your own content
            </Text>
          </div>

          <div className="flex flex-col items-center gap-y-6 px-6 py-16 text-center small:py-20">
            <span>
              <Heading
                level="h1"
                className="text-3xl leading-10 text-ui-fg-base font-normal"
              >
                Well done! Your store is up and running
              </Heading>
              <Heading
                level="h2"
                className="text-3xl leading-10 text-ui-fg-subtle font-normal"
              >
                Need help customizing your store?
              </Heading>
            </span>

            {/* Deliberately the loud element in the middle of the block. The
                deploy tutorial videos show a shopper landing here and clicking
                straight through to the article, so anyone following along has
                to find the same landmark in the same place. Moving it into the
                footer strip broke that. */}
            <a
              href={TUTORIAL_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-x-1 text-xl underline underline-offset-4 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="hero-tutorial-link"
            >
              Visit the tutorial
              <ArrowUpRightMini />
            </a>

            <LocalizedClientLink href="/store">
              <Button variant="secondary" data-testid="hero-shop-button">
                Go to shop
              </Button>
            </LocalizedClientLink>
          </div>

          <NextSteps />

          <div className="grid grid-cols-1 gap-6 border-t-2 border-dashed border-ui-border-strong px-6 py-5 small:grid-cols-[1fr_auto] small:gap-10">
            {/* No second link to the tutorial here. The one in the middle is
                the one the videos point at, and two links to the same article
                two rows apart just dilutes it. */}
            <div className="flex flex-col gap-y-1">
              <Text size="small" leading="compact" className="text-ui-fg-base">
                Make this page your own
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Everything inside this dashed box is example content that ships
                with the template. The tutorial above walks through replacing it
                with your own design, and the rest of the store with it.
              </Text>
              <Text
                size="small"
                leading="compact"
                className="mt-2 text-ui-fg-muted"
              >
                This store was deployed from{" "}
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-x-1 text-ui-fg-subtle underline hover:text-ui-fg-base"
                  data-testid="hero-repo-link"
                >
                  {REPO_SLUG}
                  <ArrowUpRightMini />
                </a>
              </Text>
            </div>

            <div className="flex flex-col gap-y-1 small:max-w-sm small:border-l-2 small:border-dashed small:border-ui-border-strong small:pl-10">
              <Text size="small" leading="compact" className="text-ui-fg-muted">
                Also from the maintainer
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                My Own Suite, a private cloud you run yourself: passwords,
                photos, files and calendars on your own hardware. Open source.
              </Text>
              <a
                href="https://myownsuite.org/"
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex w-fit items-center gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base txt-small"
                data-testid="hero-mos-link"
              >
                myownsuite.org
                <ArrowUpRightMini />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Hero

/* ==========================================================================
 * EXAMPLE SECTION END
 * ========================================================================== */
