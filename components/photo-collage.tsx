"use client";

import Image from "next/image";
import { photos, type Photo } from "@/data/photos";

const tracks = [[6, 0, 2, 9], [3, 8, 1, 7], [5, 4, 6, 2]] as const;
const cropPositions: Record<string, string> = {
  threshold: "50% 38%", "familiar-corner": "50% 42%", "basket-duty": "50% 40%",
  "looking-up": "50% 34%", "under-the-table": "50% 42%", feather: "50% 54%",
  "morning-eyes": "50% 38%", "full-stretch": "50% 48%", "carpet-study": "50% 50%",
  "quietly-here": "50% 46%",
};

function PhotoTile({ photo, index, onSelect, priority = false }: { photo: Photo; index: number; onSelect: () => void; priority?: boolean }) {
  return (
    <button type="button" aria-label={`Open photograph ${index + 1} of ${photos.length}: ${photo.title}`} className="photo-tile group relative block shrink-0 overflow-hidden bg-foreground/10 shadow-[0_20px_50px_-30px_rgba(31,35,70,0.75)] focus-visible:z-30 focus-visible:outline-offset-4" onClick={onSelect}>
      <Image src={photo.src} alt="" fill priority={priority} draggable={false} sizes="(max-width: 639px) 42vw, (max-width: 1023px) 30vw, 20vw" style={{ objectPosition: cropPositions[photo.id] }} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
      <span className="photo-label absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#14172a]/80 via-[#14172a]/25 to-transparent px-3 pb-3 pt-10 text-left text-white sm:px-4 sm:pb-4">
        <span className="block text-sm font-semibold leading-tight sm:text-base">{photo.title}</span>
      </span>
    </button>
  );
}

function DuplicateTile({ photo }: { photo: Photo }) {
  return (
    <div className="photo-tile relative shrink-0 overflow-hidden bg-foreground/10">
      <Image src={photo.src} alt="" fill draggable={false} sizes="(max-width: 639px) 42vw, (max-width: 1023px) 30vw, 20vw" style={{ objectPosition: cropPositions[photo.id] }} className="object-cover" />
    </div>
  );
}

export function PhotoCollage({ onSelect, paused }: { onSelect: (index: number) => void; paused: boolean }) {
  return (
    <div className="photo-collage" aria-label="Ten photographs of Sucuk">
      {tracks.map((indices, trackIndex) => (
        <div className="photo-row" key={trackIndex}>
          <div className={`marquee-track ${trackIndex === 1 ? "marquee-reverse" : ""}`} style={{ animationDuration: `${[58, 68, 54][trackIndex]}s`, animationPlayState: paused ? "paused" : "running" }}>
            <div className="track-group" role="group" aria-label={`Gallery row ${trackIndex + 1}`}>
              {indices.map((index, itemIndex) =>
                trackIndex === 2 && itemIndex > 1 ? (
                  <span aria-hidden="true" className="contents" key={`${trackIndex}-filler-${photos[index].id}`}>
                    <DuplicateTile photo={photos[index]} />
                  </span>
                ) : (
                  <PhotoTile key={`${trackIndex}-${photos[index].id}`} photo={photos[index]} index={index} onSelect={() => onSelect(index)} priority={trackIndex === 0 && itemIndex === 0} />
                ),
              )}
            </div>
            <div className="track-group" aria-hidden="true">
              {indices.map((index) => <DuplicateTile photo={photos[index]} key={`duplicate-${trackIndex}-${photos[index].id}`} />)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
