"use client"

import Link from "next/link"
import { useState } from "react"

import HomeParticleLogoHero from "@modules/home/components/home-particle-logo-hero"
import { V3_TUNING, WORDMARK_GRADIENT } from "../(main)/particle-flow/v3-splash"

export default function DanHome({ countryCode }: { countryCode: string }) {
  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <div className="dan-content" style={{ position: "relative", minHeight: "100vh" }}>

      {/* DMC particle animation — top of page */}
      <HomeParticleLogoHero
        presentation="embedded"
        interactionMode="newmix"
        animatedParticleCap={55000}
        logoSrc="/branding/dmc-logo-1.png"
        inkPolarity="bright"
        sectionAriaLabel="DMC particle logo"
        newmixLiveTuning={V3_TUNING}
        wordmarkGradient={WORDMARK_GRADIENT}
      />

      {/* Header + image section — sits below the animation, fills the viewport */}
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
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
            <p
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 3.5rem)",
                fontWeight: "400",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Daniel Mudie Cunningham
            </p>
            <p
              style={{
                fontSize: "clamp(1.4rem, 2.8vw, 2.8rem)",
                fontWeight: "400",
                margin: "0.2rem 0 0",
              }}
            >
              Curation, Creation, Criticism
            </p>
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
                }}
              >
                About
              </button>
            )}
            <Link
              href={`/${countryCode}/dan/creation/proud-mary`}
              style={{
                textDecoration: "none",
                color: "#1a1a1a",
                fontWeight: "700",
                fontSize: "1rem",
              }}
            >
              Works
            </Link>
          </nav>
        </header>

        {/* Image + About panel */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Jukebox image — full width when about closed, left half when open */}
          <div style={{ flex: 1, overflow: "hidden", transition: "flex 0.5s ease" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dan/fs4-2000x1300-crop-1-q90.png"
              alt="Funeral Songs — jukebox installation"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>

          {/* About panel — slides in from right */}
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
                <p style={{ marginTop: 0 }}>
                  Dr Daniel Mudie Cunningham is an artist, curator, writer and
                  educator, and the Director of{" "}
                  <span style={{ textDecoration: "underline" }}>
                    Wollongong Art Gallery.
                  </span>
                </p>
                <p>
                  As a respected arts leader and curator he has held roles at
                  institutions including Carriageworks, Performance Space,
                  Artbank, Cementa, Hazelhurst Arts Centre; and teaching roles
                  at the National Art School and Western Sydney University.
                </p>
                <p>
                  His artistic work spans video, photography, performance and
                  text, tracing how memory, grief and identity are shaped
                  through the technologies of popular culture and art history.
                  His approach to curation and education extends his artistic
                  concerns, using archives and storytelling to connect people,
                  histories and ideas.
                </p>
                <p>
                  Across three decades, his practice has approached the archive
                  as both subject and medium — a living record where personal
                  and collective histories converge. His acclaimed work{" "}
                  <em>Funeral Songs</em> is a defining example of this
                  distillation.
                </p>
                <p>
                  His work has been widely exhibited and collected by
                  institutions including the Art Gallery of Western Australia,
                  the National Film and Sound Archive, Artbank, the City of
                  Sydney, Murray Art Museum Albury, Campbelltown Arts Centre,
                  and the Museum of Old and New Art (MONA), which is currently
                  presenting his ongoing video series <em>Proud Mary</em>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
