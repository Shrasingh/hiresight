import React from "react";
import { ResumePage, NoBreak, Bullets, RichText, InlineContacts } from "./frame";
import { getContactList } from "./resume-data";

/**
 * Template 1 — Classic FAANG.
 * One column, black & white, strong hierarchy, ATS-friendly. Mirrors the
 * clean single-column format widely used at Google/Meta/Amazon/Microsoft.
 */
export default function ClassicFaang({ data }) {
  const ink = "#111827";
  const sub = "#374151";

  const Section = ({ title, children }) => (
    <section style={{ marginTop: 18 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 12.5,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: ink,
          borderBottom: `1.5px solid ${ink}`,
          paddingBottom: 4,
          marginBottom: 8,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );

  const Entry = ({ e }) => (
    <NoBreak style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13.5, color: ink }}>
          {e.title}
          {e.organization ? `, ${e.organization}` : ""}
        </span>
        <span style={{ fontSize: 11.5, color: sub, whiteSpace: "nowrap" }}>
          {e.dateRange}
        </span>
      </div>
      <Bullets
        items={e.bullets}
        linkColor={ink}
        style={{ fontSize: 12, color: sub, lineHeight: 1.5, marginTop: 3 }}
      />
    </NoBreak>
  );

  const contacts = getContactList(data);

  return (
    <ResumePage
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: ink,
        padding: "48px 56px",
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      <header style={{ textAlign: "center", marginBottom: 10 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: ink,
          }}
        >
          {data.name}
        </h1>
        <InlineContacts
          items={contacts}
          linkColor={sub}
          style={{ marginTop: 8, fontSize: 11.5, color: sub }}
        />
      </header>

      {data.summary && (
        <Section title="Summary">
          <p style={{ margin: 0, fontSize: 12, color: sub, lineHeight: 1.55 }}>
            <RichText text={data.summary} linkColor={ink} />
          </p>
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="Skills">
          <p style={{ margin: 0, fontSize: 12, color: sub, lineHeight: 1.6 }}>
            {data.skills.join(" · ")}
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
