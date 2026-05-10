"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

import HomeParticleLogoHero from "@modules/home/components/home-particle-logo-hero"
import { V3_TUNING, WORDMARK_GRADIENT } from "../(main)/particle-flow/v3-splash"

/** Per-word clip-up reveal — words slide in from below their own baseline. */
function SplitTextReveal({
  text,
  style,
  delayBase = 0,
  reduced,
}: {
  text: string
  style: React.CSSProperties
  delayBase?: number
  reduced: boolean
}) {
  const words = text.split(" ")
  return (
    <p style={{ ...style, display: "flex", flexWrap: "wrap", gap: "0 0.3em", margin: style.margin ?? 0 }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", lineHeight: style.lineHeight ?? 1.1 }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: reduced ? 0 : "105%" }}
            animate={{ y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.55, delay: delayBase + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </p>
  )
}

/** Nav link with underline that draws on hover/focus. */
function DrawLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ textDecoration: "none", color: "#1a1a1a", fontWeight: "700", fontSize: "1rem", position: "relative" }}
      className="group"
    >
      {children}
      <span
        style={{
          position: "absolute",
          bottom: -2,
          left: 0,
          height: 1,
          width: "100%",
          background: "#1a1a1a",
          transformOrigin: "left",
          transform: "scaleX(0)",
          transition: "transform 0.28s ease-out",
        }}
        className="group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </Link>
  )
}

export default function DanHome({ countryCode }: { countryCode: string }) {
  const [aboutOpen, setAboutOpen] = useState(false)
  const reduced = useReducedMotion() ?? false

  const bioParagraphs = [
    <>
      Dr Daniel Mudie Cunningham is an artist, curator, writer and educator, and the Director of{" "}
      <span style={{ textDecoration: "underline" }}>Wollongong Art Gallery.</span>
    </>,
    <>
      As a respected arts leader and curator he has held roles at institutions including Carriageworks,
      Performance Space, Artbank, Cementa, Hazelhurst Arts Centre; and teaching roles at the National Art
      School and Western Sydney University.
    </>,
    <>
      His artistic work spans video, photography, performance and text, tracing how memory, grief and
      identity are shaped through the technologies of popular culture and art history. His approach to
      curation and education extends his artistic concerns, using archives and storytelling to connect
      people, histories and ideas.
    </>,
    <>
      Across three decades, his practice has approached the archive as both subject and medium — a living
      record where personal and collective histories converge. His acclaimed work <em>Funeral Songs</em> is
      a defining example of this distillation.
    </>,
    <>
      His work has been widely exhibited and collected by institutions including the Art Gallery of Western
      Australia, the National Film and Sound Archive, Artbank, the City of Sydney, Murray Art Museum
      Albury, Campbelltown Arts Centre, and the Museum of Old and New Art (MONA), which is currently
      presenting his ongoing video series <em>Proud Mary</em>.
    </>,
  ]

  return (
    <div className="dan-content" style={{ position: "relative", minHeight: "100vh" }}>

      {/* DMC particle animation with photo-reveal behind it */}
      <div style={{ position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dan/proud-mary-hero.webp"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            pointerEvents: "none",
          }}
        />
        <HomeParticleLogoHero
          presentation="embedded"
          interactionMode="newmix"
          animatedParticleCap={55000}
          logoSrc="/branding/dmc-logo-1.png"
          inkPolarity="bright"
          sectionAriaLabel="DMC particle logo"
          newmixLiveTuning={V3_TUNING}
          wordmarkGradient={WORDMARK_GRADIENT}
          bgClassName=""
        />
      </div>

      {/* Header + image section */}
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header — split-text reveal on mount */}
        <header
          className="dan-header"
          style={{
            flexShrink: 0,
            padding: "1.5rem 2.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            position: "relative",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <SplitTextReveal
              text="Daniel Mudie Cunningham"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.5rem)", fontWeight: "400", lineHeight: 1.1 }}
              delayBase={0.1}
              reduced={reduced}
            />
            <SplitTextReveal
              text="Curation, Creation, Criticism"
              style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.8rem)", fontWeight: "400", lineHeight: 1.2, margin: "0.2rem 0 0" }}
              delayBase={0.35}
              reduced={reduced}
            />
          </div>

          <nav
            style={{
              position: "absolute",
              right: "2.5rem",
              top: "1.75rem",
              display: "flex",
              gap: "1.5rem",
              alignItems: "center",
            }}
          >
            {!aboutOpen && (
              <button
                onClick={() => setAboutOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  padding: 0,
                  position: "relative",
                }}
                className="group"
              >
                About
                <span
                  style={{
                    position: "absolute",
                    bottom: -2,
                    left: 0,
                    height: 1,
                    width: "100%",
                    background: "#1a1a1a",
                    transformOrigin: "left",
                    transform: "scaleX(0)",
                    transition: "transform 0.28s ease-out",
                  }}
                  className="group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </button>
            )}
            <DrawLink href={`/${countryCode}/dan/creation/proud-mary`}>Works</DrawLink>
          </nav>
        </header>

        {/* Image + About panel */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Jukebox image — Ken Burns slow pan/zoom */}
          <div style={{ flex: 1, overflow: "hidden", transition: "flex 0.5s ease" }}>
            <motion.img
              // eslint-disable-next-line @next/next/no-img-element
              src="/dan/fs4-2000x1300-crop-1-q90.png"
              alt="Funeral Songs — jukebox installation"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              animate={reduced ? {} : { scale: [1, 1.06], x: ["0%", "-3%"] }}
              transition={reduced ? {} : { duration: 22, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
          </div>

          {/* About panel — slides in from right; bio words blur in */}
          <div
            style={{
              width: aboutOpen ? "50%" : "0",
              overflow: "hidden",
              transition: "width 0.5s ease",
              backgroundColor: "#f0ece4",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "50vw",
                height: "100%",
                padding: "2rem 3rem",
                position: "relative",
                overflowY: "auto",
              }}
            >
              <button
                onClick={() => setAboutOpen(false)}
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "2rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  padding: 0,
                }}
              >
                Close (x)
              </button>

              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  marginTop: 0,
                  marginBottom: "1.5rem",
                }}
              >
                About
              </h2>

              <div style={{ fontSize: "1rem", lineHeight: 1.75, maxWidth: "520px" }}>
                {bioParagraphs.map((para, i) => (
                  <motion.p
                    key={i}
                    style={{ marginTop: i === 0 ? 0 : undefined }}
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={
                      aboutOpen
                        ? { opacity: 1, filter: "blur(0px)" }
                        : { opacity: 0, filter: "blur(8px)" }
                    }
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.5, delay: aboutOpen ? 0.3 + i * 0.08 : 0, ease: "easeOut" }
                    }
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
