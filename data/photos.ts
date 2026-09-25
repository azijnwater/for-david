export type Photo = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  title: string;
  caption: string;
  ratio: readonly [number, number];
  size: "small" | "medium" | "large";
};

export const photos = [
  {
    id: "threshold",
    src: "/photos/sucuk-01.jpg",
    width: 1512,
    height: 2688,
    alt: "Sucuk sitting in a doorway and looking into the room",
    title: "At the threshold",
    caption: "Waiting for the day to begin.",
    ratio: [3, 4],
    size: "medium",
  },
  {
    id: "familiar-corner",
    src: "/photos/sucuk-02.jpg",
    width: 1512,
    height: 2688,
    alt: "Sucuk resting on the floor beside a wooden cabinet",
    title: "A familiar corner",
    caption: "A little space, taken slowly.",
    ratio: [4, 5],
    size: "large",
  },
  {
    id: "basket-duty",
    src: "/photos/sucuk-03.jpg",
    width: 1512,
    height: 2688,
    alt: "Sucuk standing inside a woven basket",
    title: "Basket duty",
    caption: "Important work, mostly.",
    ratio: [3, 4],
    size: "small",
  },
  {
    id: "looking-up",
    src: "/photos/sucuk-04.jpg",
    width: 1512,
    height: 2688,
    alt: "Sucuk looking upward with an expressive face",
    title: "Looking up",
    caption: "Always interested in what comes next.",
    ratio: [4, 5],
    size: "medium",
  },
  {
    id: "under-the-table",
    src: "/photos/sucuk-05.jpg",
    width: 1512,
    height: 2688,
    alt: "Sucuk resting underneath a piece of furniture",
    title: "Under the table",
    caption: "The best seat in the room.",
    ratio: [3, 4],
    size: "small",
  },
  {
    id: "feather",
    src: "/photos/sucuk-06.jpg",
    width: 1512,
    height: 2688,
    alt: "Sucuk sleeping beside a feather toy",
    title: "Feather on the floor",
    caption: "Found, claimed, repeated.",
    ratio: [4, 5],
    size: "large",
  },
  {
    id: "morning-eyes",
    src: "/photos/sucuk-07.jpg",
    width: 2409,
    height: 3200,
    alt: "Close portrait of Sucuk resting with sleepy eyes",
    title: "Morning eyes",
    caption: "Still deciding whether to wake up.",
    ratio: [4, 5],
    size: "small",
  },
  {
    id: "full-stretch",
    src: "/photos/sucuk-08.jpg",
    width: 2409,
    height: 3200,
    alt: "Sucuk stretched out across rumpled bedding",
    title: "Full stretch",
    caption: "A rare moment of perfect comfort.",
    ratio: [3, 4],
    size: "medium",
  },
  {
    id: "carpet-study",
    src: "/photos/sucuk-09.jpg",
    width: 2409,
    height: 3200,
    alt: "Sucuk lying on a carpet beside a sofa",
    title: "Carpet study",
    caption: "A quiet patch of afternoon light.",
    ratio: [4, 5],
    size: "large",
  },
  {
    id: "quietly-here",
    src: "/photos/sucuk-10.jpg",
    width: 2409,
    height: 3200,
    alt: "Sucuk peeking over the edge of a bed",
    title: "Quietly here",
    caption: "Just beyond the edge of the bed.",
    ratio: [4, 5],
    size: "small",
  },
] as const satisfies readonly Photo[];
