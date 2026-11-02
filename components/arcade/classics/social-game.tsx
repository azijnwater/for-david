"use client";
import { useEffect, useState } from "react";
import { SucukMark } from "@/components/sucuk-mark";

const rooms = ["Plaza", "Café", "Beach", "Igloo"] as const;
const friends = {
  Plaza: "Miso",
  Café: "Mochi",
  Beach: "Pepper",
  Igloo: "Luna",
};
export function ClubSucuk({ onFinish }: { onFinish: (score: number) => void }) {
  const [room, setRoom] = useState<(typeof rooms)[number]>("Plaza");
  const [coins, setCoins] = useState(0),
    [fish, setFish] = useState(0);
  const [visited, setVisited] = useState<string[]>(["Plaza"]);
  const [outfit, setOutfit] = useState("Birthday scarf"),
    [wardrobe, setWardrobe] = useState(["Birthday scarf"]);
  const [line, setLine] = useState(
    "Welcome to Club Sucuk. Visit the crew, catch fish and decorate your igloo.",
  );
  const [cast, setCast] = useState<"ready" | "waiting" | "bite">("ready");
  const [ended, setEnded] = useState(false);
  useEffect(() => {
    if (cast === "ready") return;
    const timer = setTimeout(
      () => {
        if (cast === "waiting") {
          setCast("bite");
          setLine("A fish! Reel it in before it escapes.");
        } else {
          setCast("ready");
          setLine("That fish swam away. Cast again.");
        }
      },
      cast === "waiting" ? 1800 + Math.random() * 1500 : 1800,
    );
    return () => clearTimeout(timer);
  }, [cast]);
  function travel(next: (typeof rooms)[number]) {
    setRoom(next);
    setCast("ready");
    setVisited((v) => (v.includes(next) ? v : [...v, next]));
    setLine(`${friends[next]} is waiting in the ${next.toLowerCase()}.`);
  }
  function buy(item: string) {
    if (wardrobe.includes(item)) {
      setOutfit(item);
      return;
    }
    if (coins < 10) {
      setLine("Catch a fish or throw snowballs to earn 10 treats.");
      return;
    }
    setCoins(coins - 10);
    setWardrobe([...wardrobe, item]);
    setOutfit(item);
    setLine(`${item} unlocked. Looking very Sucuk.`);
  }
  return (
    <div className="club-game">
      <div className="game-hud">
        <span>
          Treats <b>{coins}</b>
        </span>
        <span>
          Fish <b>{fish}</b>
        </span>
        <span>Rooms {visited.length}/4</span>
      </div>
      <nav className="club-map" aria-label="Club rooms">
        {rooms.map((name) => (
          <button
            type="button"
            key={name}
            className="arcade-small-button"
            aria-pressed={room === name}
            onClick={() => travel(name)}
          >
            {name}
          </button>
        ))}
      </nav>
      <div className={`club-room club-${room === "Beach" ? "beach" : "snow"}`}>
        <p className="club-room-sign">
          {room === "Igloo" ? "Sucuk’s cozy igloo" : `Club Sucuk · ${room}`}
        </p>
        <div className="club-cats">
          <div>
            <SucukMark />
            <strong>Sucuk</strong>
            <span>{outfit}</span>
          </div>
          <div>
            <SucukMark />
            <strong>{friends[room]}</strong>
            <span>
              {room === "Café" ? "Cocoa & company" : "Your local cat crew"}
            </span>
          </div>
        </div>
        <span className="club-scenery" aria-hidden="true">
          {room === "Café"
            ? "☕"
            : room === "Beach"
              ? "⛵"
              : room === "Igloo"
                ? "🏠"
                : "❄"}
        </span>
      </div>
      <p className="puzzle-feedback" role="status">
        {line}
      </p>
      <div className="classic-management">
        <button
          type="button"
          className="arcade-small-button"
          onClick={() =>
            setLine(
              `${friends[room]}: ${room === "Café" ? "Happy second birthday, Sucuk! Have a warm bowl of milk." : room === "Beach" ? "Watch the fishing line. Reel as soon as you see a bite!" : room === "Igloo" ? "We brought cushions for the birthday party." : "The whole island is celebrating you today."}`,
            )
          }
        >
          Talk to {friends[room]}
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => {
            setCoins(coins + 1);
            setLine(`${friends[room]} caught your snowball! +1 treat.`);
          }}
        >
          Throw a snowball
        </button>
        {room === "Beach" && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={cast === "waiting"}
            onClick={() => {
              if (cast === "bite") {
                setFish(fish + 1);
                setCoins(coins + 10);
                setLine("Caught it! +10 treats.");
                setCast("ready");
              } else {
                setCast("waiting");
                setLine("Waiting for a bite…");
              }
            }}
          >
            {cast === "bite"
              ? "Reel in!"
              : cast === "waiting"
                ? "Watching the float…"
                : "Cast fishing line"}
          </button>
        )}
        {room === "Café" && (
          <button
            type="button"
            className="arcade-small-button"
            onClick={() =>
              setLine(
                "Mochi serves birthday cocoa. The café is warm and the cushions are soft.",
              )
            }
          >
            Order birthday cocoa
          </button>
        )}
      </div>
      <div className="classic-management">
        <span>Outfit shop · 10 treats each</span>
        {["Party hat", "Moon cape", "Snow boots"].map((item) => (
          <button
            type="button"
            className="arcade-small-button"
            key={item}
            aria-pressed={outfit === item}
            onClick={() => buy(item)}
          >
            {item}
            {wardrobe.includes(item) ? " ✓" : " · 10"}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={
          ended || visited.length < 4 || fish < 1 || wardrobe.length < 2
        }
        onClick={() => {
          setEnded(true);
          setLine("The whole crew is here. Happy second birthday, Sucuk!");
          onFinish(coins + fish * 100 + 500);
        }}
      >
        Host the igloo birthday party
      </button>
      <p className="arcade-fine-print">
        Party checklist: visit all four rooms, catch a fish, unlock an outfit.
        This is a solo town with cat NPCs.
      </p>
    </div>
  );
}
