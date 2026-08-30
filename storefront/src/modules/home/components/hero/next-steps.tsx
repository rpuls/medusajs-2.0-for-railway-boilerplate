import Image from "next/image"
import { ArrowUpRightMini, PlaySolid } from "@medusajs/icons"
import { Text, clx } from "@medusajs/ui"

/**
 * The "what do I do now" rail inside the example section.
 *
 * A fresh deploy leaves two things unconfigured that a real shop cannot open
 * without: taking money and sending mail. Each has a setup video, so this
 * points at them in the order a shop owner needs them rather than making them
 * go hunting through the README.
 *
 * Only genuinely outstanding work belongs here. Search is not listed because a
 * Railway deploy configures MeiliSearch automatically.
 *
 * Covers are the videos' own YouTube thumbnails. hqdefault.jpg exists for every
 * video (maxresdefault does not), and object-cover crops its 4:3 letterboxing
 * back to 16:9.
 */

/* Part of the EXAMPLE SECTION. Deleting the hero folder removes this too. */

type Guide = {
  videoId: string
  title: string
  description: string
}

const GUIDES: Guide[] = [
  {
    videoId: "dcSOpIzc1Og",
    title: "Learn how to setup payment",
    description:
      "Connect Stripe so the checkout can accept real orders instead of the manual test provider.",
  },
  {
    videoId: "pbdZm26YDpE",
    title: "Learn how to setup emailing",
    description:
      "Set up Resend so order confirmations and admin invites actually reach an inbox.",
  },
  // Deliberately no MeiliSearch card. A Railway deploy wires search up on its
  // own, so pointing people at a setup video would send them off to do work
  // that is already done.
]

const NextSteps = () => {
  return (
    <div
      className="border-t-2 border-dashed border-ui-border-strong px-6 py-8"
      data-testid="hero-next-steps"
    >
      <Text
        size="small"
        leading="compact"
        className="mb-4 text-ui-fg-base uppercase tracking-wider"
      >
        Suggested next steps
      </Text>

      {/* Both column classes are written out in full so Tailwind emits them.
          Add a guide above and the rail lays itself out. */}
      <ul
        className={clx("grid grid-cols-1 gap-5", {
          "small:grid-cols-2": GUIDES.length === 2,
          "small:grid-cols-3": GUIDES.length !== 2,
        })}
      >
        {GUIDES.map((guide) => (
          <li key={guide.videoId}>
            <a
              href={`https://youtu.be/${guide.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full items-stretch gap-x-4 overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base p-3 transition-shadow hover:shadow-elevation-card-hover"
              data-testid="hero-guide-card"
            >
              {/* Deliberately a small fixed-width still, not a full-bleed
                  cover. These are a footnote to the example section, and at
                  card width the thumbnails shouted louder than the heading
                  above them. */}
              <div className="relative aspect-[16/9] w-32 shrink-0 overflow-hidden rounded bg-ui-bg-subtle xsmall:w-40">
                <Image
                  src={`https://img.youtube.com/vi/${guide.videoId}/hqdefault.jpg`}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                {/* Marks the still as a video rather than decoration. */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors group-hover:bg-black/80">
                    <PlaySolid />
                  </span>
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-y-1 py-1">
                <Text
                  size="small"
                  leading="compact"
                  className="text-ui-fg-base group-hover:text-ui-fg-interactive"
                >
                  {guide.title}
                </Text>
                <Text
                  size="small"
                  leading="compact"
                  className="flex-1 text-ui-fg-subtle"
                >
                  {guide.description}
                </Text>
                <span className="mt-1 flex items-center gap-x-1 text-ui-fg-interactive txt-small">
                  Watch the setup video
                  <ArrowUpRightMini />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default NextSteps
