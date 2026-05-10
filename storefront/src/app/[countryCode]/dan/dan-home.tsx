"use client"

import Link from "next/link"
import { useState } from "react"

export default function DanHome({ countryCode }: { countryCode: string }) {
  const [aboutOpen, setAboutOpen] = useState(true)

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          padding: "2rem 2.5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "400",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Daniel Mudie Cunningham
          </p>
          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "400",
              margin: "0.3rem 0 0",
            }}
          >
            Curation, Creation, Criticism
          </p>
        </div>
        <nav style={{ position: "absolute", right: "2.5rem", top: "2rem" }}>
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

      {/* Body */}
      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 110px)",
          position: "relative",
        }}
      >
        {/* Left: circular hero image */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            transition: "flex 0.5s ease",
          }}
        >
          <div
            style={{
              width: "min(420px, 75%)",
              aspectRatio: "1",
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dan/fs4-2000x1300-crop-1-q90.png"
              alt="Funeral Songs — jukebox installation"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>

        {/* Right: About panel (slides in from right) */}
        <div
          style={{
            width: aboutOpen ? "50%" : "0",
            overflow: "hidden",
            transition: "width 0.5s ease",
            backgroundColor: "#f0ece4",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {/* Inner div keeps width stable so text doesn't reflow during animation */}
          <div
            style={{
              width: "50vw",
              padding: "2rem 3rem",
              position: "relative",
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

            <div
              style={{
                fontSize: "1rem",
                lineHeight: 1.75,
                maxWidth: "520px",
              }}
            >
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
                Artbank, Cementa, Hazelhurst Arts Centre; and teaching roles at
                the National Art School and Western Sydney University.
              </p>
              <p>
                His artistic work spans video, photography, performance and
                text, tracing how memory, grief and identity are shaped through
                the technologies of popular culture and art history. His
                approach to curation and education extends his artistic
                concerns, using archives and storytelling to connect people,
                histories and ideas.
              </p>
              <p>
                Across three decades, his practice has approached the archive
                as both subject and medium — a living record where personal and
                collective histories converge. His acclaimed work{" "}
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

      {/* Floating "About" button when panel is closed */}
      {!aboutOpen && (
        <button
          onClick={() => setAboutOpen(true)}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "none",
            border: "1px solid #1a1a1a",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontFamily: "inherit",
            padding: "0.5rem 1.25rem",
            color: "#1a1a1a",
            backgroundColor: "#f9c8d4",
          }}
        >
          About
        </button>
      )}
    </div>
  )
}
