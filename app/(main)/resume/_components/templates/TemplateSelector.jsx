"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RESUME_TEMPLATES } from "./index";
import ScaledResume from "./ScaledResume";

/**
 * Template gallery. Each card shows a live, real-data thumbnail of the
 * template, hover elevation, a selected state, and a "Use Template" action.
 * Selecting instantly updates the preview without touching resume data.
 */
export default function TemplateSelector({ data, selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {RESUME_TEMPLATES.map((t) => {
        const isSelected = t.id === selectedId;
        const { Component } = t;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            aria-pressed={isSelected}
            className={cn(
              "group text-left rounded-xl border bg-card overflow-hidden transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-premium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary ring-2 ring-primary/40 shadow-premium"
                : "border-border hover:border-primary/40"
            )}
          >
            {/* Live thumbnail */}
            <div className="relative h-52 overflow-hidden bg-muted/40 flex justify-center pt-4">
              <div className="shadow-md rounded-sm overflow-hidden">
                <ScaledResume scale={0.28}>
                  <Component data={data} />
                </ScaledResume>
              </div>
              {isSelected && (
                <span className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground shadow">
                  <Check className="h-4 w-4" />
                </span>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
            </div>

            {/* Meta */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm">{t.name}</h3>
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ background: t.accent }}
                  aria-hidden
                />
              </div>
              <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                {t.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {t.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div
                className={cn(
                  "mt-2 w-full rounded-md text-center text-xs font-medium py-1.5 transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                )}
              >
                {isSelected ? "Selected" : "Use Template"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
