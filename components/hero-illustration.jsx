"use client";

import React from "react";

/**
 * Original, hand-authored SVG hero illustration.
 * Scene: a confident college student at her desk with an open laptop and a
 * prominent floating resume document (ATS 98%), surrounded by subtle AI
 * sparkles. Minimal, futuristic, premium-SaaS aesthetic with blue/purple
 * gradient accents. Fully vector — scales crisply, no external assets, and
 * reads well on both light and dark themes because it sits on its own
 * gradient panel.
 *
 * Decorative only → aria-hidden; the section provides the accessible label.
 */
export default function HeroIllustration({ className = "" }) {
  return (
    <svg
      role="img"
      aria-label="A confident college student at her laptop building an ATS-optimized resume"
      viewBox="0 0 600 470"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hs-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
        <linearGradient id="hs-brand-soft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="hs-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="100%" stopColor="#faf5ff" />
        </linearGradient>
        <linearGradient id="hs-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <radialGradient id="hs-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <filter id="hs-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="12"
            stdDeviation="14"
            floodColor="#4c1d95"
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      {/* Panel + ambient glow */}
      <rect x="12" y="18" width="576" height="420" rx="34" fill="url(#hs-panel)" />
      <ellipse cx="300" cy="210" rx="300" ry="220" fill="url(#hs-glow)" />

      {/* Decorative floating blobs */}
      <circle cx="80" cy="90" r="26" fill="#c4b5fd" opacity="0.55" />
      <circle cx="540" cy="360" r="34" fill="#a5b4fc" opacity="0.5" />
      <rect
        x="470"
        y="70"
        width="46"
        height="46"
        rx="14"
        fill="url(#hs-brand-soft)"
        opacity="0.55"
        transform="rotate(18 493 93)"
      />

      {/* ===== Floating resume document (focal point) ===== */}
      <g filter="url(#hs-shadow)">
        <rect x="352" y="96" width="196" height="252" rx="14" fill="#ffffff" />
        {/* header band */}
        <rect x="352" y="96" width="196" height="52" rx="14" fill="url(#hs-brand)" />
        <rect x="352" y="132" width="196" height="16" fill="url(#hs-brand)" />
        <circle cx="384" cy="122" r="15" fill="#ffffff" opacity="0.9" />
        <circle cx="384" cy="118" r="6" fill="#c7d2fe" />
        <path d="M374 132a10 10 0 0 1 20 0z" fill="#c7d2fe" />
        <rect x="408" y="112" width="86" height="8" rx="4" fill="#ffffff" opacity="0.95" />
        <rect x="408" y="126" width="60" height="6" rx="3" fill="#ffffff" opacity="0.7" />

        {/* section: heading + lines */}
        <rect x="372" y="170" width="54" height="7" rx="3.5" fill="#7c3aed" />
        <rect x="372" y="185" width="156" height="5" rx="2.5" fill="#e5e7eb" />
        <rect x="372" y="196" width="156" height="5" rx="2.5" fill="#e5e7eb" />
        <rect x="372" y="207" width="120" height="5" rx="2.5" fill="#e5e7eb" />

        <rect x="372" y="228" width="44" height="7" rx="3.5" fill="#7c3aed" />
        <rect x="372" y="243" width="156" height="5" rx="2.5" fill="#e5e7eb" />
        <rect x="372" y="254" width="156" height="5" rx="2.5" fill="#e5e7eb" />
        <rect x="372" y="265" width="100" height="5" rx="2.5" fill="#e5e7eb" />

        {/* skill chips */}
        <rect x="372" y="286" width="40" height="7" rx="3.5" fill="#7c3aed" />
        <rect x="372" y="301" width="38" height="14" rx="7" fill="#ede9fe" />
        <rect x="416" y="301" width="46" height="14" rx="7" fill="#ede9fe" />
        <rect x="468" y="301" width="34" height="14" rx="7" fill="#ede9fe" />
        <rect x="372" y="322" width="52" height="14" rx="7" fill="#ede9fe" />
        <rect x="430" y="322" width="40" height="14" rx="7" fill="#ede9fe" />
      </g>

      {/* ATS score badge */}
      <g filter="url(#hs-shadow)">
        <rect x="486" y="150" width="86" height="40" rx="20" fill="#ffffff" />
        <circle cx="508" cy="170" r="12" fill="#dcfce7" />
        <path
          d="M502 170l4 4 8-8"
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="526"
          y="167"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="9"
          fontWeight="700"
          fill="#111827"
        >
          ATS
        </text>
        <text
          x="526"
          y="180"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="12"
          fontWeight="800"
          fill="#16a34a"
        >
          98%
        </text>
      </g>

      {/* ===== Desk ===== */}
      <rect x="40" y="366" width="520" height="16" rx="8" fill="#ddd6fe" />
      <rect x="40" y="366" width="520" height="7" rx="3.5" fill="#c4b5fd" />

      {/* Plant */}
      <rect x="70" y="330" width="34" height="36" rx="6" fill="#a78bfa" />
      <path d="M87 330c-2-20-14-26-22-28 6 10 8 20 22 28z" fill="#34d399" />
      <path d="M87 330c2-22 16-28 26-30-8 12-10 22-26 30z" fill="#10b981" />
      <path d="M87 332c0-16 0-26 0-34 4 10 6 22 0 34z" fill="#059669" />

      {/* Coffee cup */}
      <rect x="470" y="344" width="30" height="22" rx="5" fill="#ffffff" />
      <rect x="470" y="344" width="30" height="7" rx="3.5" fill="#c4b5fd" />
      <path
        d="M500 349h6a6 6 0 0 1 0 12h-6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
      />

      {/* ===== Laptop ===== */}
      <g filter="url(#hs-shadow)">
        {/* lid / screen */}
        <rect x="150" y="238" width="188" height="126" rx="10" fill="#1e1b4b" />
        <rect x="160" y="248" width="168" height="106" rx="5" fill="url(#hs-screen)" />
        {/* code/resume UI on screen */}
        <rect x="172" y="262" width="60" height="7" rx="3.5" fill="#a78bfa" />
        <rect x="172" y="278" width="120" height="5" rx="2.5" fill="#4338ca" />
        <rect x="172" y="289" width="104" height="5" rx="2.5" fill="#4338ca" />
        <rect x="172" y="306" width="46" height="6" rx="3" fill="#818cf8" />
        <rect x="172" y="320" width="120" height="5" rx="2.5" fill="#4338ca" />
        <rect x="172" y="331" width="82" height="5" rx="2.5" fill="#4338ca" />
        <circle cx="300" cy="330" r="14" fill="#7c3aed" opacity="0.55" />
        <path
          d="M293 330l5 5 9-10"
          fill="none"
          stroke="#e9d5ff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* base */}
      <path d="M120 364h248l14 12H106z" fill="#c7d2fe" />
      <rect x="106" y="366" width="276" height="10" rx="5" fill="#a5b4fc" />

      {/* ===== The student ===== */}
      <g>
        {/* chair back */}
        <rect x="196" y="196" width="120" height="150" rx="30" fill="#c4b5fd" opacity="0.6" />
        {/* torso / hoodie */}
        <path
          d="M212 356c0-52 20-84 44-84s44 32 44 84z"
          fill="url(#hs-brand)"
        />
        <path
          d="M238 300c6 10 30 10 36 0"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* neck */}
        <rect x="246" y="236" width="20" height="26" rx="10" fill="#f0b28a" />
        {/* head */}
        <circle cx="256" cy="212" r="30" fill="#f7c19b" />
        {/* hair */}
        <path
          d="M226 214c-4-26 14-44 30-44s34 16 32 42c-2-6-6-10-10-12 2 8 0 14-2 18-2-10-8-16-14-18 0 0 4 8 2 16-8-2-16 0-22 6-4-2-8-2-12 0-2-8-2-8-4-8z"
          fill="#4c2a1e"
        />
        <path
          d="M226 210c-6 22-4 60 2 96-18-6-26-30-24-58 2-22 12-36 22-38z"
          fill="#4c2a1e"
        />
        <path
          d="M286 210c8 20 8 58 2 96 16-8 22-32 20-58-2-22-12-36-22-38z"
          fill="#5a3324"
        />
        {/* glasses (smart, confident) */}
        <circle cx="245" cy="212" r="8" fill="none" stroke="#312e81" strokeWidth="2.4" />
        <circle cx="267" cy="212" r="8" fill="none" stroke="#312e81" strokeWidth="2.4" />
        <path d="M253 212h6" stroke="#312e81" strokeWidth="2.4" />
        {/* smile */}
        <path
          d="M250 226a8 6 0 0 0 12 0"
          fill="none"
          stroke="#b45309"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* arm resting toward laptop */}
        <path
          d="M300 300c18 6 30 22 34 44l-22 8c-6-18-16-30-30-34z"
          fill="url(#hs-brand)"
        />
        <circle cx="330" cy="350" r="9" fill="#f7c19b" />
      </g>

      {/* ===== AI sparkles ===== */}
      <g fill="url(#hs-brand)">
        <path d="M356 70l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
        <path d="M120 150l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" opacity="0.9" />
        <path d="M330 200l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" opacity="0.8" />
      </g>
      <circle cx="150" cy="110" r="4" fill="#c026d3" opacity="0.7" />
      <circle cx="440" cy="380" r="5" fill="#7c3aed" opacity="0.6" />
    </svg>
  );
}
