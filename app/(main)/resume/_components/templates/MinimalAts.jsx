import React from "react";
import { ResumePage, NoBreak, Bullets, RichText, InlineContacts } from "./frame";
import { getContactList } from "./resume-data";

/**
 * Template 3 — Minimal ATS.
 * Pure ATS-first: single column, system sans, no color, no columns, no icons.
 * Optimized for resume parsers with clean, predictable structure & spacing.
 */
export default function MinimalAts({ data }) {
  const ink = "#000000";

  const Section = ({ title, children }) => (
    <section style={{ marginTop: 16 }}>
      <h2
        style={{
          margin: "0 0 6px",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: ink,
          borderBottom: "1px solid #000000",
          paddingBottom: 3,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );

  const Entry = ({ e }) => (
    <NoBreak style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 12.5 }}>{e.title}</span>
        <span style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>{e.dateRange}</span>
      </div>
      {e.organization && (
        <div style={{ fontSize: 12, fontStyle: "italic" }}>{e.organization}</div>
      )}
      <Bullets items={e.bullets} linkColor={ink} style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 2 }} />
    </NoBreak>
  );

  const contacts = getContactList(data);

  return (
    <ResumePage
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: ink,
        padding: "44px 52px",
        fontSize: 11.5,
        lineHeight: 1.45,
      }}
    >
      <header>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{data.name}</h1>
        <InlineContacts
          items={contacts}
          separator=" | "
          linkColor={ink}
          style={{ marginTop: 4, fontSize: 11.5 }}
        />
      </header>

      {data.summary && (
        <Section title="Summary">
          <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.5 }}>
            <RichText text={data.summary} linkColor={ink} />
          </p>
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="Skills">
          <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.55 }}>
            {data.skills.join(", ")}
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
        <Section title="Projects">
          {data.projects.map((e, i) => (
            <Entry key={i} e={e} />
          ))}
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
