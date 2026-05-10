"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const slides = [
  {
    type: "video" as const,
    caption: "Daniel Mudie Cunningham, Proud Mary, 2007, 2012, 2017, 2022",
    bg: "#111",
    label: "Proud Mary — four-channel composite",
  },
  {
    type: "image" as const,
    src: "/dan/pm-2007.webp",
    caption: "Daniel Mudie Cunningham, Proud Mary, 2007",
    alt: "Proud Mary, 2007 — performance still",
  },
  {
    type: "image" as const,
    src: "/dan/pm-2012.webp",
    caption: "Daniel Mudie Cunningham, Proud Mary, 2012",
    alt: "Proud Mary, 2012 — underground carpark, Sydney",
  },
  {
    type: "image" as const,
    src: "/dan/pm-2017.webp",
    caption: "Daniel Mudie Cunningham, Proud Mary, 2017",
    alt: "Proud Mary, 2017 — New Norfolk, Tasmania",
  },
  {
    type: "image" as const,
    src: "/dan/pm-2022.webp",
    caption: "Daniel Mudie Cunningham, Proud Mary, 2022",
    alt: "Proud Mary, 2022 — Port Kembla, New South Wales",
  },
]

const soloExhibitions = [
  { title: "Funeral Songs", venue: "MOP, 2007" },
  { title: "Funeral Songs", venue: "MONA, 2012" },
  { title: "Proud Mary", venue: "AEAF, 2014" },
  { title: "Proud Mary", venue: "Wagga Wagga Gallery, 2017" },
  { title: "Are You There?", venue: "Wollongong Art Gallery, 2023" },
  { title: "Proud Mary", venue: "Manly Art Gallery, 2024" },
]

const groupExhibitions = [
  { title: "Stupid Little Dreamer", venue: "Inflight, 2008" },
  { title: "You're My No. 1", venue: "Firstdraft, 2017" },
  { title: "", venue: "MONA, collection hang, 2017–18" },
  { title: "", venue: "MONA, collection hang, 2022–current" },
  { title: "Songs to uncover what is there", venue: "FELTspace, 2024" },
]

const collections = ["Museum of Old and New Art"]

/** Per-word clip-up reveal from below. */
function SplitTextReveal({
  text,
  tag: Tag = "h1",
  style,
  reduced,
}: {
  text: string
  tag?: "h1" | "h2" | "p"
  style: React.CSSProperties
  reduced: boolean
}) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })
  const words = text.split(" ")
  return (
    <Tag ref={ref} style={{ ...style, display: "flex", flexWrap: "wrap", gap: "0 0.3em" }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", lineHeight: style.lineHeight ?? 1.2 }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: reduced ? 0 : "105%" }}
            animate={{ y: inView || reduced ? 0 : "105%" }}
            transition={reduced ? { duration: 0 } : { duration: 0.55, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Staggered fade-up list. */
function StaggerList({
  items,
  reduced,
}: {
  items: { title: string; venue: string }[]
  reduced: boolean
}) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  return (
    <div ref={ref}>
      {items.map((ex, i) => (
        <motion.p
          key={i}
          style={{ margin: "0.2rem 0" }}
          initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 }}
          animate={{ opacity: inView || reduced ? 1 : 0, y: inView || reduced ? 0 : 10 }}
          transition={reduced ? { duration: 0 } : { duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
        >
          {ex.title ? (
            <>
              <em>{ex.title}</em>, {ex.venue}
            </>
          ) : (
            ex.venue
          )}
        </motion.p>
      ))}
    </div>
  )
}

/** Thin line that sweeps in width from left. */
function DividerSweep({ reduced }: { reduced: boolean }) {
  const { ref, inView } = useInView({ threshold: 0.4, triggerOnce: true })
  return (
    <div ref={ref} style={{ padding: "0.5rem 0" }}>
      <motion.div
        style={{ height: 1, background: "rgba(26,26,26,0.25)", borderRadius: 9999 }}
        initial={{ width: reduced ? "100%" : "0%" }}
        animate={{ width: inView || reduced ? "100%" : "0%" }}
        transition={reduced ? { duration: 0 } : { duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

export default function ProudMaryPage({ countryCode }: { countryCode: string }) {
  const [slide, setSlide] = useState(0)
  const [dir, setDir] = useState(1)
  const reduced = useReducedMotion() ?? false

  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.25, triggerOnce: true })

  const goTo = (next: number) => {
    setDir(next > slide ? 1 : -1)
    setSlide(next)
  }

  const variants = {
    enter: (d: number) => ({ x: reduced ? 0 : d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: reduced ? 0 : d * -40, opacity: 0 }),
  }

  return (
    <div className="dan-content" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header
        className="dan-header"
        style={{
          padding: "2rem 2.5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.8rem", fontWeight: "400", margin: 0, lineHeight: 1.2 }}>
            Daniel Mudie Cunningham
          </p>
          <p style={{ fontSize: "1.1rem", fontWeight: "400", margin: "0.3rem 0 0" }}>
            Curation, Creation, Criticism
          </p>
        </div>
        <nav style={{ position: "absolute", right: "2.5rem", top: "2rem" }}>
          <span style={{ fontWeight: "700", fontSize: "1rem" }}>Works</span>
        </nav>
      </header>

      {/* Work title — split-text reveal */}
      <div style={{ padding: "0.5rem 2.5rem 2rem" }}>
        <SplitTextReveal
          text="Proud Mary, 2007, 2012, 2017, 2022, ongoing"
          tag="h1"
          style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", fontWeight: "400", margin: 0, lineHeight: 1.2 }}
          reduced={reduced}
        />
      </div>

      {/* Hero image — curtain wipe reveal */}
      <div ref={heroRef} style={{ width: "100%", lineHeight: 0, position: "relative", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dan/proud-mary-hero.webp"
          alt="Daniel Mudie Cunningham, Proud Mary, 2022 — Port Kembla"
          style={{ width: "100%", display: "block", objectFit: "cover" }}
        />
        {/* Curtain overlay wipes away left-to-right (clip away pink from the right when revealed) */}
        <motion.div
          style={{ position: "absolute", inset: 0, background: "#f9c8d4", transformOrigin: "right" }}
          initial={false}
          animate={{
            clipPath:
              heroInView || reduced ? "inset(0 100% 0 0)" : "inset(0 0% 0 0)",
          }}
          transition={reduced ? { duration: 0 } : { duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p
        style={{
          padding: "0.5rem 2.5rem",
          fontSize: "0.8rem",
          color: "#555",
          fontStyle: "italic",
          margin: 0,
        }}
      >
        Daniel Mudie Cunningham, Proud Mary, 2023
      </p>

      {/* Divider sweep */}
      <div style={{ padding: "0 2.5rem" }}>
        <DividerSweep reduced={reduced} />
      </div>

      {/* Two-column content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          padding: "3rem 2.5rem",
        }}
      >
        {/* Left: description + technical */}
        <div style={{ fontSize: "1rem", lineHeight: 1.8 }}>
          <p style={{ marginTop: 0 }}>
            <em>Proud Mary</em> is Daniel&rsquo;s funeral song. Daniel has been
            obsessed by Tina Turner&rsquo;s version of <em>Proud Mary</em> since
            seeing her perform live in Sydney in 1991 and 1993. The sublime
            experience of seeing Tina perform the song inspired its selection as
            the key song in the mixtape of his forthcoming funeral. First
            conceived alongside his installation{" "}
            <em>
              <span style={{ textDecoration: "underline" }}>Funeral Songs</span>
            </em>{" "}
            in 2007, Daniel&rsquo;s lip-synced video performance of{" "}
            <em>Proud Mary</em> references the many times his friends have
            witnessed him spontaneously imitate her dance moves at parties.
          </p>
          <p>
            Upon re-performing the work in an underground carpark in Sydney in
            2012, Daniel made a self-initiated promise to document his aging
            process by re-staging the performance every five years until his
            death. For the 2017 version the artist &lsquo;rolls down the
            river&rsquo; of a decrepit empty swimming pool found in New Norfolk,
            Tasmania. A field of concrete tetrahedrons at the coastal breakwater
            defence battery at Port Kembla, New South Wales, was the set of the
            2022 edition.
          </p>
          <div style={{ marginTop: "2rem", fontSize: "0.95rem", color: "#333", lineHeight: 1.6 }}>
            <p style={{ margin: "0.3rem 0" }}>
              <em>Proud Mary</em>, 2007, 2012, 2017, 2022, ongoing every five years
            </p>
            <p style={{ margin: "0.3rem 0" }}>HD four channel video with sound, 5:36 min</p>
            <p style={{ margin: "0.3rem 0" }}>
              Camera: Sari Kivinen: 2007; Don Cameron: 2012; Vera Hong: 2017;
              Vera Hong &amp; Craig Bender: 2022
            </p>
            <p style={{ margin: "0.3rem 0" }}>
              Editor: Sari Kivinen: 2007; Vera Hong: 2012, 2017, 2022
            </p>
            <p style={{ margin: "0.3rem 0" }}>Music: Proud Mary by Tina Turner, 1993</p>
            <p style={{ margin: "0.3rem 0" }}>Edition (as series) of 5 + 1 AP</p>
          </div>
        </div>

        {/* Right: exhibitions — staggered reveal */}
        <div style={{ fontSize: "0.95rem", lineHeight: 1.75 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#333" }}>
              Solo exhibitions:
            </p>
            <StaggerList items={soloExhibitions} reduced={reduced} />
          </div>
          <div style={{ marginBottom: "1.75rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#333" }}>
              Group exhibitions:
            </p>
            <StaggerList items={groupExhibitions} reduced={reduced} />
          </div>
          <div>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#333" }}>
              Collections:
            </p>
            {collections.map((c, i) => (
              <p key={i} style={{ margin: "0.2rem 0" }}>
                {c}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div style={{ padding: "1rem 4rem 4rem" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {/* Prev arrow */}
          <button
            onClick={() => goTo((slide - 1 + slides.length) % slides.length)}
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              fontFamily: "inherit",
              color: "#1a1a1a",
              padding: "0.5rem",
              lineHeight: 1,
            }}
            aria-label="Previous slide"
          >
            ←
          </button>

          {/* Slide — AnimatePresence fade + slight x shift */}
          <div style={{ flex: 1, position: "relative" }}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={reduced ? { duration: 0 } : { duration: 0.35, ease: "easeInOut" }}
              >
                {slides[slide].type === "video" ? (
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "56.25%",
                      height: 0,
                      overflow: "hidden",
                      backgroundColor: "#111",
                    }}
                  >
                    <iframe
                      title="Proud Mary — Daniel Mudie Cunningham"
                      src="https://player.vimeo.com/video/776456784?h=de0f8d1013"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                      }}
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={(slides[slide] as { src: string }).src}
                    alt={(slides[slide] as { alt: string }).alt}
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next arrow */}
          <button
            onClick={() => goTo((slide + 1) % slides.length)}
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              fontFamily: "inherit",
              color: "#1a1a1a",
              padding: "0.5rem",
              lineHeight: 1,
            }}
            aria-label="Next slide"
          >
            →
          </button>
        </div>

        {/* Caption */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#555",
            fontStyle: "italic",
            margin: "0.75rem 0 0",
          }}
        >
          {slides[slide].caption}
        </p>

        {/* Dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "0.75rem",
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: i === slide ? "#1a1a1a" : "#aaa",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "background-color 0.2s",
              }}
            />
          ))}
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link
            href={`/${countryCode}/dan`}
            style={{ textDecoration: "none", color: "#1a1a1a", fontSize: "1rem" }}
          >
            Back to creation
          </Link>
        </div>
      </div>
    </div>
  )
}
