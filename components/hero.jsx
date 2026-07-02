"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import HeroIllustration from "@/components/hero-illustration";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;
      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full pt-32 md:pt-40 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* Copy */}
          <div className="text-center lg:text-left space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-powered resumes for placement season
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl xl:text-7xl">
              Land your dream{" "}
              <span className="text-gradient animate-gradient">internship</span>
              <br className="hidden sm:block" /> with an{" "}
              <span className="text-gradient animate-gradient">
                ATS-ready resume
              </span>
            </h1>

            <p className="mx-auto lg:mx-0 max-w-[560px] text-muted-foreground md:text-lg">
              hireSight helps students craft recruiter-approved resumes,
              practice interviews, and get AI feedback — everything you need to
              stand out at FAANG/MAANG companies.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
              <Link href="/resume">
                <Button size="lg" className="px-8 w-full sm:w-auto group">
                  <FileText className="mr-2 h-4 w-4" />
                  Build My Resume
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 w-full sm:w-auto"
                >
                  Explore Career Tools
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              {["ATS-optimized", "5 premium templates", "Free to start"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Illustration */}
          <div className="hero-image-wrapper">
            <div ref={imageRef} className="hero-image">
              <HeroIllustration className="w-full h-auto max-w-2xl mx-auto drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
