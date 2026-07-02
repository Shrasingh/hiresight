import React from "react";
import { ResumePage, NoBreak, Bullets, RichText } from "./frame";
import { getContactList } from "./resume-data";

const CONTACT_LABELS = {
  email: "Email",
  mobile: "Phone",
  linkedin: "LinkedIn",
  github: "GitHub",
  portfolio: "Portfolio",
  twitter: "Twitter",
};

/**
 * Template 2 — Modern Professional.
 * Two-column layout, indigo accent, skills sidebar. Great readability for
 * Software / Product / Full-Stack engineers.
 */
export default function ModernProfessional({ data }) {
  const accent = "#4f46e5";
  const ink = "#111827";
  const sub = "#4b5563";

  const MainHeading = ({ children }) => (
    <h2
      style={{
        margin: "0 0 8px",
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: accent,
        fontWeight: 800,
      }}
    >
      {children}
    </h2>
  );

  const SideHeading = ({ children }) => (
    <h3
      style={{
        margin: "0 0 8px",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "#ffffff",
        fontWeight: 800,
        opacity: 0.95,
      }}
    >
      {children}
    </h3>
  );

  const Entry = ({ e }) => (
    <NoBreak style={{ marginBottom: 13 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 10,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13, color: ink }}>
          {e.title}
        </span>
        <span style={{ fontSize: 11, color: sub, whiteSpace: "nowrap" }}>
          {e.dateRange}
        </span>
      </div>
      {e.organization && (
        <div style={{ fontSize: 12, color: accent, fontWeight: 600 }}>
          {e.organization}
        </div>
      )}
      <Bullets
        items={e.bullets}
        bulletColor={accent}
        linkColor={accent}
        style={{ fontSize: 11.5, color: sub, lineHeight: 1.5, marginTop: 4 }}
      />
    </NoBreak>
  );

  const contacts = getContactList(data);

  const sideLine = (c) => (
    <div key={c.kind} style={{ marginBottom: 7, wordBreak: "break-word" }}>
      <div style={{ fontSize: 9.5, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {CONTACT_LABELS[c.kind]}
      </div>
      <a
        href={c.href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 11, color: "#ffffff", textDecoration: "none" }}
      >
        {c.label}
      </a>
    </div>
  );

  return (
    <ResumePage
      style={{
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: ink,
        display: "flex",
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 250,
          background: `linear-gradient(160deg, ${accent}, #7c3aed)`,
          color: "#ffffff",
          padding: "40px 26px",
          flexShrink: 0,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, lineHeight: 1.15 }}>
          {data.name}
        </h1>
        <div style={{ height: 3, width: 44, background: "#ffffff", opacity: 0.8, margin: "12px 0 20px" }} />

        {contacts.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <SideHeading>Contact</SideHeading>
            {contacts.map((c) => sideLine(c))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <SideHeading>Skills</SideHeading>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 10.5,
                    background: "rgba(255,255,255,0.16)",
                    padding: "3px 9px",
                    borderRadius: 999,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div>
            <SideHeading>Education</SideHeading>
            {data.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{e.title}</div>
                <div style={{ fontSize: 10.5, opacity: 0.9 }}>{e.organization}</div>
                <div style={{ fontSize: 10, opacity: 0.75 }}>{e.dateRange}</div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main column */}
      <main style={{ flex: 1, padding: "40px 34px" }}>
        {data.summary && (
          <section style={{ marginBottom: 20 }}>
            <MainHeading>Profile</MainHeading>
            <p style={{ margin: 0, fontSize: 12, color: sub, lineHeight: 1.55 }}>
              <RichText text={data.summary} linkColor={accent} />
            </p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <MainHeading>Experience</MainHeading>
            {data.experience.map((e, i) => (
              <Entry key={i} e={e} />
            ))}
          </section>
        )}

        {data.projects.length > 0 && (
          <section>
            <MainHeading>Projects</MainHeading>
            {data.projects.map((e, i) => (
              <Entry key={i} e={e} />
            ))}
          </section>
        )}
      </main>
    </ResumePage>
  );
}
