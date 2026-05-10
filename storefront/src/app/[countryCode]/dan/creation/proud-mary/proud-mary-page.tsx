"use client"

import Link from "next/link"
import { useState } from "react"

const slides = [
  {
    type: "image" as const,
    caption: "Daniel Mudie Cunningham, Proud Mary, 2007",
    bg: "#d8d0c8",
    label: "Proud Mary, 2007 — performance still",
  },
  {
    type: "image" as const,
    caption: "Daniel Mudie Cunningham, Proud Mary, 2012",
    bg: "#c8c8c8",
    label: "Proud Mary, 2012 — underground carpark, Sydney",
  },
  {
    type: "image" as const,
    caption: "Daniel Mudie Cunningham, Proud Mary, 2017",
    bg: "#d4c0b8",
    label: "Proud Mary, 2017 — New Norfolk, Tasmania",
  },
  {
    type: "image" as const,
    caption: "Daniel Mudie Cunningham, Proud Mary, 2022",
    bg: "#b8c8d4",
    label: "Proud Mary, 2022 — Port Kembla, New South Wales",
  },
  {
    type: "video" as const,
    caption: "Daniel Mudie Cunningham, Proud Mary, 2007, 2012, 2017, 2022",
    bg: "#111",
    label: "Proud Mary — four-channel composite",
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

export default function ProudMaryPage({ countryCode }: { countryCode: string }) {
  const [slide, setSlide] = useState(0)

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

      {/* Work title */}
      <div style={{ padding: "0.5rem 2.5rem 2rem" }}>
        <h1
          style={{
            fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
            fontWeight: "400",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Proud Mary, 2007, 2012, 2017, 2022, ongoing
        </h1>
      </div>

      {/* Hero image */}
      <div style={{ width: "100%", lineHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dan/proud-mary-hero.webp"
          alt="Daniel Mudie Cunningham, Proud Mary, 2022 — Port Kembla"
          style={{ width: "100%", display: "block", objectFit: "cover" }}
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

        {/* Right: exhibitions */}
        <div style={{ fontSize: "0.95rem", lineHeight: 1.75 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#333" }}>
              Solo exhibitions:
            </p>
            {soloExhibitions.map((ex, i) => (
              <p key={i} style={{ margin: "0.2rem 0" }}>
                {ex.title ? (
                  <>
                    <em>{ex.title}</em>, {ex.venue}
                  </>
                ) : (
                  ex.venue
                )}
              </p>
            ))}
          </div>
          <div style={{ marginBottom: "1.75rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#333" }}>
              Group exhibitions:
            </p>
            {groupExhibitions.map((ex, i) => (
              <p key={i} style={{ margin: "0.2rem 0" }}>
                {ex.title ? (
                  <>
                    <em>{ex.title}</em>, {ex.venue}
                  </>
                ) : (
                  ex.venue
                )}
              </p>
            ))}
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
            onClick={() => setSlide((s) => (s - 1 + slides.length) % slides.length)}
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

          {/* Slide */}
          <div style={{ flex: 1 }}>
            {slides[slide].type === "video" ? (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  backgroundColor: slides[slide].bg,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "1fr 1fr",
                  gap: "2px",
                  overflow: "hidden",
                }}
              >
                {["2007", "2012", "2017", "2022"].map((year) => (
                  <div
                    key={year}
                    style={{
                      backgroundColor: "#222",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.85rem",
                        fontStyle: "italic",
                      }}
                    >
                      {year}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  backgroundColor: slides[slide].bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "rgba(80,60,60,0.5)",
                    fontSize: "0.95rem",
                    fontStyle: "italic",
                  }}
                >
                  {slides[slide].label}
                </span>
              </div>
            )}
          </div>

          {/* Next arrow */}
          <button
            onClick={() => setSlide((s) => (s + 1) % slides.length)}
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
              onClick={() => setSlide(i)}
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

        {/* Vimeo embed */}
        <div style={{ marginTop: "3rem" }}>
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
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
