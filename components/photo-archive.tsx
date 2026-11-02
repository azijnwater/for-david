"use client";

import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { photos } from "@/data/photos";
import { Navigation } from "@/components/navigation";
import { PhotoCollage } from "@/components/photo-collage";
import { Button } from "@/components/ui/button";
import { BirthdayCopy, BirthdayDecor } from "@/components/birthday-provider";

const PhotoLightbox = dynamic(
  () => import("@/components/photo-lightbox").then((module) => module.PhotoLightbox),
  { ssr: false },
);

export function PhotoArchive() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="work" className="hero-section relative min-h-[100svh] bg-background text-foreground">
      <div className="hero-stage relative h-[100svh] overflow-hidden">
        <Navigation />
        <BirthdayDecor />

        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-48 top-[12%] size-[34rem] rounded-full bg-[#c98952]/12 blur-[100px] dark:bg-[#7b4828]/20" />
          <div className="absolute -right-40 bottom-[-12%] size-[36rem] rounded-full bg-[#9b8262]/10 blur-[120px] dark:bg-[#3d3428]/25" />
          <div className="hero-grid absolute inset-0 opacity-45" />
        </div>

        <div className="collage-motion absolute inset-0 z-[1]">
          <PhotoCollage onSelect={setActiveIndex} paused={isPaused} />
        </div>

        <div className="hero-copy pointer-events-none absolute inset-x-5 top-[12%] z-20 sm:inset-x-8 sm:top-[17%] lg:left-[5vw] lg:top-[26%] lg:w-[38vw] lg:max-w-[620px]">
          <div aria-hidden="true" className="copy-veil" />
          <p className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.26em] text-foreground/55 sm:mb-5 sm:text-[10px]">
            <span className="size-1.5 rounded-full bg-foreground" />
            <BirthdayCopy birthday="02.11.2026 · A very special occasion">A small life, closely observed</BirthdayCopy>
          </p>
          <h1 className="text-[clamp(4rem,10vw,9rem)] font-semibold uppercase leading-[0.78] tracking-[-0.08em]">
            <BirthdayCopy birthday={<>Sucuk<br /><span className="birthday-title-line">turns two!</span></>}>Sucuk</BirthdayCopy>
          </h1>
          <p className="mt-3 font-display text-[clamp(1.65rem,3.3vw,3.5rem)] italic leading-[0.95] tracking-[-0.04em] sm:mt-5">
            <BirthdayCopy birthday="Small cat. Big birthday.">small cat, big life.</BirthdayCopy>
          </p>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-foreground/62 sm:mt-6 sm:max-w-md sm:text-sm">
            <BirthdayCopy birthday="Two years of stolen seats, serious naps, and making this house a home. Today, the whole place is a party for Sucuk.">A drifting collection of ordinary moments, soft landings, and places that feel like home.</BirthdayCopy>
          </p>
          <div className="pointer-events-auto mt-5 flex flex-wrap items-center gap-3 sm:mt-7">
            <Button
              className="bg-foreground text-background hover:bg-foreground/88"
              onClick={() => setActiveIndex(0)}
            >
              <BirthdayCopy birthday="Two years in pictures">Open the archive</BirthdayCopy>
              <ArrowUpRight aria-hidden="true" size={15} />
            </Button>
            <a
              href="#about"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-foreground/10 bg-background/55 px-4 text-xs font-medium text-foreground/75 shadow-sm backdrop-blur-md transition-colors hover:bg-background/85 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <BirthdayCopy birthday="The birthday cat">Meet Sucuk</BirthdayCopy>
              <ArrowDown aria-hidden="true" size={14} />
            </a>
            <button
              type="button"
              aria-pressed={isPaused}
              onClick={() => setIsPaused((value) => !value)}
              className="motion-toggle inline-flex size-11 items-center justify-center rounded-full border border-foreground/15 bg-background/55 text-foreground/75 backdrop-blur-md transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {isPaused ? <Play aria-hidden="true" size={14} /> : <Pause aria-hidden="true" size={14} />}
              <span className="sr-only">{isPaused ? "Resume gallery motion" : "Pause gallery motion"}</span>
            </button>
          </div>
        </div>

        <div className="hero-footer pointer-events-none absolute inset-x-5 bottom-5 z-20 flex items-end justify-between sm:inset-x-8 sm:bottom-7 lg:inset-x-10">
          <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-foreground/65">
            10 photographs
            <br />
            one small cat
          </p>
          <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/65 sm:flex">
            Scroll to meet Sucuk
            <span className="h-px w-12 bg-foreground/30" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/65"><BirthdayCopy birthday="EST. 2024 · LOVED EVERY DAY">Photo archive · 2026</BirthdayCopy></p>
        </div>

      </div>

      <PhotoLightbox
        photos={photos}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        onClose={() => setActiveIndex(null)}
      />
    </section>
  );
}
