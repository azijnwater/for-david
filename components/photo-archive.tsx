"use client";

import { ArrowDown, Images, Pause, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { photos } from "@/data/photos";
import { Navigation } from "@/components/navigation";
import { PhotoCollage } from "@/components/photo-collage";
import { Candle, CandleButton, useBirthday, useCandle } from "@/components/birthday-provider";

const PhotoLightbox = dynamic(
  () => import("@/components/photo-lightbox").then((module) => module.PhotoLightbox),
  { ssr: false },
);

export function PhotoArchive() {
  const birthday = useBirthday();
  const candle = useCandle();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="work" className="hero-section" aria-labelledby="hero-title">
      <div className="hero-stage">
        <Navigation />

        <div className="hero-copy">
          {birthday ? (
            <>
              <h1 id="hero-title" className="hero-title">
                <span className="hero-title-row">
                  <span>Sucuk<br />turns</span>
                  <Candle lit={candle.lit} />
                  <span className="sr-only">two</span>
                </span>
              </h1>
              <p className="hero-tagline">Small cat, big birthday.</p>
              <p className="hero-intro">
                Two years of stolen seats, serious naps, and making this house a home. Today the whole site is his party.
              </p>
            </>
          ) : (
            <>
              <h1 id="hero-title" className="hero-title">Sucuk</h1>
              <p className="hero-tagline">Small cat, big life.</p>
              <p className="hero-intro">
                A drifting collection of ordinary moments, soft landings, and the places that feel like home.
              </p>
            </>
          )}

          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => setActiveIndex(0)}>
              <Images size={17} aria-hidden="true" />
              {birthday ? "See two years of photos" : "Browse the photos"}
            </button>
            {birthday ? (
              <CandleButton lit={candle.lit} wishes={candle.wishes} onToggle={candle.toggle} />
            ) : (
              <a href="#about" className="btn btn-secondary">
                Meet Sucuk <ArrowDown aria-hidden="true" size={16} />
              </a>
            )}
            <button
              type="button"
              aria-pressed={isPaused}
              onClick={() => setIsPaused((value) => !value)}
              className="motion-toggle btn btn-ghost btn-icon"
              title={isPaused ? "Resume gallery motion" : "Pause gallery motion"}
            >
              {isPaused ? <Play aria-hidden="true" size={16} /> : <Pause aria-hidden="true" size={16} />}
              <span className="sr-only">{isPaused ? "Resume gallery motion" : "Pause gallery motion"}</span>
            </button>
          </div>
        </div>

        <div className="collage-motion">
          <PhotoCollage onSelect={setActiveIndex} paused={isPaused} />
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
