import React from "react";
import { Mail, Phone, Linkedin, Twitter, Github, Globe } from "lucide-react";
import { ResumePage, NoBreak, Bullets, RichText } from "./frame";
import { getContactList } from "./resume-data";

const CONTACT_ICONS = {
  email: Mail,
  mobile: Phone,
  linkedin: Linkedin,
  github: Github,
  portfolio: Globe,
  twitter: Twitter,
};

/**
 * Template 4 — Premium Tech.
 * Elegant typography, subtle line icons, generous whitespace, a slim accent
 * rail. Recruiter-friendly, refined — in the spirit of Stripe / Airbnb /
 * Uber / Databricks / OpenAI engineering resumes.
 */
export default function PremiumTech({ data }) {
  const accent = "#7c3aed";
  const ink = "#0f172a";
  const sub = "#475569";

  const Section = ({ title, children }) => (
    <section style={{ marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {title}
        </span>
        <span style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>
      {children}
    </section>
  );

  const Entry = ({ e }) => (
    <NoBreak style={{ marginBottom: 14, paddingLeft: 14, borderLeft: `2px solid #ede9fe` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13.5, color: ink }}>{e.title}</span>
        <span style={{ fontSize: 11, color: sub, whiteSpace: "nowrap" }}>{e.dateRange}</span>
      </div>
      {e.organization && (
        <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginTop: 1 }}>
          {e.organization}
        </div>
      )}
      <Bullets
        items={e.bullets}
        bulletColor={accent}
        linkColor={accent}
        style={{ fontSize: 12, color: sub, lineHeight: 1.55, marginTop: 5 }}
      />
    </NoBreak>
  );

  const contactItems = getContactList(data);

  return (
    <ResumePage
      style={{
        fontFamily: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
        color: ink,
        padding: "48px 56px",
        fontSize: 12,
        lineHeight: 1.55,
      }}
    >
      <header style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: -0.4, color: ink }}>
          {data.name}
        </h1>
        {contactItems.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 18px",
              marginTop: 10,
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {contactItems.map((c) => {
              const Icon = CONTACT_ICONS[c.kind];
              return (
                <a
                  key={c.kind}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: sub, textDecoration: "none" }}
                >
                  {Icon && <Icon size={13} color={accent} strokeWidth={2} />}
                  {c.label}
                </a>
              );
            })}
          </div>
        )}
      </header>

      {data.summary && (
        <Section title="Profile">
          <p style={{ margin: 0, fontSize: 12.5, color: sub, lineHeight: 1.6 }}>
            <RichText text={data.summary} linkColor={accent} />
          </p>
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title="Experience">
          {data.experience.map((e, i) => (
            <Entry key={i} e={e} />
          ))}
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="Selected Projects">
          {data.projects.map((e, i) => (
            <Entry key={i} e={e} />
          ))}
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
            {data.skills.map((s, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11,
                  color: "#4c1d95",
                  background: "#f5f3ff",
                  border: "1px solid #ede9fe",
                  padding: "3px 10px",
                  borderRadius: 6,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {data.education.length > 0 && (
        <Section title="Education">
          {data.education.map((e, i) => (
            <Entry key={i} e={e} />
          ))}
        </Section>
      )}
    </ResumePage>
  );
}
