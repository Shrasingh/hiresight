import React from "react";
import { ResumePage, NoBreak, Bullets, RichText, InlineContacts } from "./frame";
import { getContactList } from "./resume-data";

/**
 * Template 5 — Student / Fresher.
 * Education-first ordering for college students, freshers and internship
 * applicants — Education → Projects → Skills → Experience. Friendly, modern
 * accent header, yet clean enough for FAANG internship applications.
 */
export default function StudentFresher({ data }) {
  const accent = "#4f46e5";
  const accent2 = "#c026d3";
  const ink = "#111827";
  const sub = "#4b5563";

  const Section = ({ title, children }) => (
    <section style={{ marginTop: 18 }}>
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: 12.5,
          fontWeight: 800,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: accent,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 2, background: accent2, display: "inline-block" }} />
        {title}
      </h2>
      {children}
    </section>
  );

  const Entry = ({ e }) => (
    <NoBreak style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: ink }}>{e.title}</span>
        <span style={{ fontSize: 11, color: sub, whiteSpace: "nowrap" }}>{e.dateRange}</span>
      </div>
      {e.organization && (
        <div style={{ fontSize: 12, color: sub, fontWeight: 600 }}>{e.organization}</div>
      )}
      <Bullets
        items={e.bullets}
        bulletColor={accent}
        style={{ fontSize: 11.5, color: sub, lineHeight: 1.5, marginTop: 3 }}
      />
    </NoBreak>
  );

  const contacts = getContactList(data);

  return (
    <ResumePage
      style={{
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: ink,
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      {/* Header band */}
      <header
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent2})`,
          color: "#ffffff",
          padding: "32px 48px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: -0.3 }}>
          {data.name}
        </h1>
        <InlineContacts
          items={contacts}
          linkColor="#ffffff"
          style={{ marginTop: 8, fontSize: 11.5, opacity: 0.95 }}
        />
      </header>

      <div style={{ padding: "26px 48px 44px" }}>
        {data.summary && (
          <Section title="Career Objective">
            <p style={{ margin: 0, fontSize: 12, color: sub, lineHeight: 1.55 }}>
              <RichText text={data.summary} linkColor={accent} />
            </p>
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((e, i) => (
              <Entry key={i} e={e} />
            ))}
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section title="Projects">
            {data.projects.map((e, i) => (
              <Entry key={i} e={e} />
            ))}
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section title="Skills & Tools">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 11,
                    color: accent,
                    background: "#eef2ff",
                    padding: "4px 11px",
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {data.experience.length > 0 && (
          <Section title="Experience & Internships">
            {data.experience.map((e, i) => (
              <Entry key={i} e={e} />
            ))}
          </Section>
        )}
      </div>
    </ResumePage>
  );
}
