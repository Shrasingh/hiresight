// Shared A4 page frame + presentational helpers for all templates.
// Fixed pixel dimensions (A4 @96dpi) make html2pdf capture deterministic and
// keep every resume to EXACTLY ONE PAGE — content is uniformly scaled down to
// fit when it would otherwise overflow (scale = 1 in the normal case).

import React, { useLayoutEffect, useRef, useState } from "react";
import { parseInlineLinks } from "./resume-data";

export const A4_WIDTH = 794; // px  (210mm @96dpi)
export const A4_MIN_HEIGHT = 1123; // px  (297mm @96dpi)

/**
 * A single A4 sheet. The inner content is measured and, if it exceeds one
 * page, scaled down uniformly so the whole resume always fits on ONE page
 * with no clipping and no page-2 overflow (scale = 1 in the normal case).
 * `style` carries per-template typography (font / padding / color / layout).
 */
export function ResumePage({ style, children }) {
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // scrollHeight reflects the untransformed layout, so this stays stable
    // regardless of the scale we then apply (transforms are post-layout).
    const h = el.scrollHeight;
    const next = h > A4_MIN_HEIGHT ? A4_MIN_HEIGHT / h : 1;
    setScale((prev) => (Math.abs(prev - next) > 0.001 ? next : prev));
  });

  return (
    <div
      style={{
        width: A4_WIDTH,
        height: A4_MIN_HEIGHT,
        background: "#ffffff",
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div
        ref={contentRef}
        style={{
          width: A4_WIDTH,
          minHeight: A4_MIN_HEIGHT,
          boxSizing: "border-box",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Keeps an entry from being visually split (still useful when scaled). */
export function NoBreak({ children, style }) {
  return <div style={{ breakInside: "avoid", ...style }}>{children}</div>;
}

/**
 * Contact line rendered as clickable <a> tags separated by `separator`.
 * `items` come from getContactList(data): [{ kind, label, href }].
 */
export function InlineContacts({
  items,
  separator = "  •  ",
  linkColor = "inherit",
  style,
}) {
  if (!items || items.length === 0) return null;
  return (
    <p style={{ margin: 0, ...style }}>
      {items.map((c, i) => (
        <React.Fragment key={c.kind}>
          {i > 0 && <span style={{ opacity: 0.6 }}>{separator}</span>}
          <a
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: linkColor, textDecoration: "none" }}
          >
            {c.label}
          </a>
        </React.Fragment>
      ))}
    </p>
  );
}

/**
 * Renders text with any markdown links `[label](url)` or bare URLs turned into
 * real clickable <a> tags (also picked up by html2pdf as PDF link annotations).
 */
export function RichText({ text, linkColor = "#4f46e5", style }) {
  const segments = parseInlineLinks(text);
  if (segments.length === 0) return null;
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "link" ? (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: linkColor, textDecoration: "none", ...style }}
          >
            {seg.label}
          </a>
        ) : (
          <React.Fragment key={i}>{seg.value}</React.Fragment>
        )
      )}
    </>
  );
}

/** Renders description lines: one line → paragraph, many → bullet list. */
export function Bullets({
  items,
  style = {},
  bulletColor = "#111827",
  linkColor = "#4f46e5",
}) {
  if (!items || items.length === 0) return null;
  if (items.length === 1) {
    return (
      <p style={{ margin: 0, ...style }}>
        <RichText text={items[0]} linkColor={linkColor} />
      </p>
    );
  }
  return (
    <ul
      style={{ margin: "4px 0 0", paddingLeft: 0, listStyle: "none", ...style }}
    >
      {items.map((b, i) => (
        <li
          key={i}
          style={{ position: "relative", paddingLeft: 14, marginBottom: 3 }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              color: bulletColor,
              fontWeight: 700,
            }}
          >
            •
          </span>
          <RichText text={b} linkColor={linkColor} />
        </li>
      ))}
    </ul>
  );
}
