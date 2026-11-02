"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Photo } from "@/data/photos";

type PhotoLightboxProps = {
  photos: readonly Photo[];
  activeIndex: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

export function PhotoLightbox({ photos, activeIndex, onIndexChange, onClose }: PhotoLightboxProps) {
  const photo = activeIndex === null ? null : photos[activeIndex];
  const reduceMotion = useReducedMotion();

  const move = (direction: -1 | 1) => {
    if (activeIndex === null) return;
    onIndexChange((activeIndex + direction + photos.length) % photos.length);
  };

  return (
    <Dialog.Root
      open={activeIndex !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#14172a]/96 opacity-0 backdrop-blur-md transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden text-[#eceef4] opacity-0 outline-none transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              move(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              move(1);
            }
          }}
        >
          <Dialog.Title className="sr-only">Sucuk photo archive</Dialog.Title>
          <Dialog.Description className="sr-only">
            Browse the photographs with the arrow keys, previous and next buttons, or swipe gestures.
          </Dialog.Description>

          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close photo archive"
              className="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-full border border-white/15 bg-white/8 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black focus-visible:outline-white sm:right-6 sm:top-6"
            >
              <X aria-hidden="true" size={19} />
            </button>
          </Dialog.Close>

          {photo ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={photo.id}
                className="flex w-full flex-col items-center"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragEnd={(_, gesture) => {
                    if (gesture.offset.x < -60 || gesture.velocity.x < -500) move(1);
                    if (gesture.offset.x > 60 || gesture.velocity.x > 500) move(-1);
                  }}
                  className="relative h-[min(72svh,850px)] w-[min(88vw,1500px)] touch-pan-y select-none"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    priority
                    draggable={false}
                    sizes="(max-width: 640px) 90vw, 82vw"
                    className="pointer-events-none object-contain"
                  />
                </motion.div>
                <figcaption className="mt-4 flex max-w-3xl items-end justify-between gap-6 px-2 sm:mt-6 sm:w-[82vw] sm:px-0">
                  <div>
                    <p className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{photo.title}</p>
                    <p className="mt-1 hidden text-white/75 sm:block">{photo.caption}</p>
                  </div>
                  <p className="hidden max-w-xs text-right text-sm leading-relaxed text-white/70 md:block">
                    Use the arrow keys or swipe to wander.
                  </p>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          ) : null}

          <div className="absolute inset-x-4 bottom-5 flex items-center justify-between sm:inset-x-6 sm:bottom-6">
            <button
              type="button"
              aria-label="Previous photograph"
              className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/8 transition-colors hover:bg-white hover:text-black focus-visible:outline-white"
              onClick={() => move(-1)}
            >
              <ChevronLeft aria-hidden="true" size={19} />
            </button>
            <span aria-live="polite" className="tabular text-sm font-semibold text-white/85">
              {(activeIndex ?? 0) + 1} / {photos.length}
            </span>
            <button
              type="button"
              aria-label="Next photograph"
              className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/8 transition-colors hover:bg-white hover:text-black focus-visible:outline-white"
              onClick={() => move(1)}
            >
              <ChevronRight aria-hidden="true" size={19} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
