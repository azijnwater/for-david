import { SucukMark } from "@/components/sucuk-mark";

export function GameArt({ art }: { art: string }) {
  if (art.startsWith("classic-")) return <ClassicArt art={art} />;
  return (
    <div className={`game-art art-${art}`} aria-hidden="true">
      <svg viewBox="0 0 320 170" focusable="false">
        {art === "sled" && (
          <>
            <path
              d="M-10 45C40 50 75 135 145 135S235 88 330 120"
              stroke="#25235e"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M104 99h53q5 0 8-7M109 92h40"
              stroke="#25235e"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M240 32v35m0-35h22v17h-22"
              stroke="#a95800"
              fill="#ffb21f"
              strokeWidth="2"
            />
          </>
        )}
        {art === "yarn" && (
          <>
            <path
              d="M-5 135H85V55H165V105H245"
              fill="none"
              stroke="#8f9bb9"
              strokeWidth="22"
              strokeLinejoin="round"
            />
            <circle cx="270" cy="105" r="20" fill="#ffb21f" />
            <path
              d="M260 88q30 20 0 34m-7-26q30-15 35 7"
              stroke="#25235e"
              fill="none"
            />
          </>
        )}
        {art === "shelf" && (
          <>
            {Array.from({ length: 15 }, (_, i) => (
              <rect
                key={i}
                x={33 + (i % 5) * 52}
                y={27 + Math.floor(i / 5) * 27}
                width="45"
                height="20"
                rx="4"
                fill={["#8f9bb9", "#ffb21f", "#f9dde8"][Math.floor(i / 5)]}
              />
            ))}
            <rect
              x="125"
              y="140"
              width="80"
              height="10"
              rx="5"
              fill="#25235e"
            />
            <circle cx="190" cy="122" r="8" fill="#ffb21f" />
          </>
        )}
        {art === "pong" && (
          <>
            <path
              d="M160 16v140"
              stroke="#8f9bb9"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
            <rect x="45" y="60" width="12" height="65" rx="6" fill="#25235e" />
            <rect x="265" y="25" width="12" height="65" rx="6" fill="#8f9bb9" />
            <circle cx="204" cy="102" r="15" fill="#ffb21f" />
          </>
        )}
        {art === "feather" && (
          <>
            {Array.from({ length: 12 }, (_, i) => (
              <g
                key={i}
                transform={`translate(${55 + (i % 6) * 42} ${22 + Math.floor(i / 6) * 40}) rotate(-22)`}
              >
                <ellipse rx="7" ry="13" fill="#8f9bb9" />
                <path d="M0-10v28" stroke="#25235e" />
              </g>
            ))}
            <path
              d="M160 110v20m-35-15v12m70-10v15"
              stroke="#ffb21f"
              strokeWidth="4"
            />
          </>
        )}
        {art === "fly" && (
          <>
            <path
              d="M65 0v60h35V0M65 170v-45h35v45M230 0v35h35V0M230 170V100h35v70"
              fill="#8f9bb9"
            />
            <path
              d="M110 110q50-75 100-35"
              stroke="#25235e"
              strokeDasharray="5 6"
              fill="none"
            />
            <circle cx="167" cy="65" r="8" fill="#ffb21f" />
          </>
        )}
        {art === "run" && (
          <>
            <path d="M0 135H320" stroke="#25235e" strokeWidth="3" />
            <rect x="210" y="95" width="40" height="40" rx="3" fill="#ffb21f" />
            <path
              d="M230 95v40M60 75h45M45 90h40M55 105h35"
              stroke="#8f9bb9"
              strokeWidth="4"
            />
            <path
              d="M135 106q35-85 65-20"
              stroke="#25235e"
              strokeDasharray="5 6"
              fill="none"
            />
          </>
        )}
        {art === "treat" && (
          <>
            {[60, 115, 180, 250].map((x, i) => (
              <circle
                key={x}
                cx={x}
                cy={30 + (i % 3) * 30}
                r="12"
                fill="#ffb21f"
              />
            ))}
            <rect x="205" y="20" width="15" height="40" rx="7" fill="#4f7652" />
            <path d="M115 125h90l-12 30h-66Z" fill="#8f9bb9" />
          </>
        )}
        {art === "sofa" && (
          <>
            <rect
              x="82"
              y="15"
              width="156"
              height="40"
              rx="12"
              fill="#f9dde8"
            />
            <path
              d="M0 85H320M0 125H320"
              stroke="#8f9bb9"
              strokeWidth="2"
              strokeDasharray="9 8"
            />
            <rect x="45" y="68" width="65" height="26" rx="13" fill="#25235e" />
            <rect
              x="215"
              y="110"
              width="65"
              height="26"
              rx="13"
              fill="#25235e"
            />
            <circle cx="77" cy="81" r="5" fill="#ffb21f" />
          </>
        )}
        {art === "memory" && (
          <>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <g key={i}>
                <rect
                  x={54 + (i % 4) * 55}
                  y={30 + Math.floor(i / 4) * 62}
                  width="45"
                  height="52"
                  rx="7"
                  fill={i === 1 || i === 6 ? "#ffb21f" : "#8f9bb9"}
                />
                <text
                  x={76 + (i % 4) * 55}
                  y={64 + Math.floor(i / 4) * 62}
                  textAnchor="middle"
                  fontSize="24"
                  fill="#25235e"
                >
                  {i === 1 || i === 6 ? "☀" : "?"}
                </text>
              </g>
            ))}
          </>
        )}
        {art === "box" && (
          <>
            {[70, 160, 250].map((x, i) => (
              <g key={x}>
                <path d={`M${x - 30} 90h60v45h-60Z`} fill="#ffb21f" />
                <path
                  d={`M${x} 90v45m-30-45-10-12h60l10 12`}
                  fill="none"
                  stroke="#25235e"
                  strokeWidth="2"
                />
                {i === 1 && (
                  <>
                    <ellipse
                      cx={x}
                      cy="55"
                      rx="10"
                      ry="23"
                      transform={`rotate(20 ${x} 55)`}
                      fill="#8f9bb9"
                    />
                    <path
                      d={`M${x + 4} 40l-12 48`}
                      stroke="#25235e"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            ))}
          </>
        )}
        {art === "merge" && (
          <>
            {[2, 4, 8, 16, 32, 64, 128, 256].map((n, i) => (
              <g key={n}>
                <rect
                  x={47 + (i % 4) * 59}
                  y={28 + Math.floor(i / 4) * 60}
                  width="53"
                  height="53"
                  rx="8"
                  fill={i < 3 ? "#f9dde8" : i < 6 ? "#ffb21f" : "#25235e"}
                />
                <text
                  x={73 + (i % 4) * 59}
                  y={62 + Math.floor(i / 4) * 60}
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="bold"
                  fill={i > 5 ? "#fff8f3" : "#25235e"}
                >
                  {n}
                </text>
              </g>
            ))}
          </>
        )}
        {art === "lights" && (
          <>
            {Array.from({ length: 15 }, (_, i) => (
              <g key={i}>
                <rect
                  x={60 + (i % 5) * 43}
                  y={20 + Math.floor(i / 5) * 43}
                  width="34"
                  height="34"
                  rx="5"
                  fill={[2, 5, 7, 10, 13].includes(i) ? "#ffb21f" : "#25235e"}
                />
                <path
                  d={`M${77 + (i % 5) * 43} ${24 + Math.floor(i / 5) * 43}v26m-13-13h26`}
                  stroke="#fff8f3"
                  opacity=".45"
                />
              </g>
            ))}
          </>
        )}
      </svg>
      {["yarn", "feather", "fly", "run", "sofa", "sled"].includes(art) && (
        <SucukMark className={`art-cat cat-${art}`} />
      )}
    </div>
  );
}

function ClassicArt({ art }: { art: string }) {
  const engine = art.split("-")[1],
    seed = [...art].reduce((sum, c) => sum + c.charCodeAt(0), 0),
    colors = ["#8f9bb9", "#ffb21f", "#f9dde8", "#65a5bd"];
  return (
    <div className={`game-art art-${engine}`} aria-hidden="true">
      <svg viewBox="0 0 320 170" focusable="false">
        <rect
          width="320"
          height="170"
          fill={seed % 2 ? "#fff8f3" : "#e5e8f2"}
        />
        {["defense", "war"].includes(engine) ? (
          <>
            <path
              d="M0 100H80V50H160V125H240V75H320"
              fill="none"
              stroke="#c9d0e5"
              strokeWidth="24"
            />
            {[45, 120, 210, 275].map((x, n) => (
              <g key={x}>
                <rect
                  x={x - 14}
                  y={35 + (n % 2) * 65}
                  width="28"
                  height="35"
                  rx="7"
                  fill={colors[n]}
                />
                <circle cx={x} cy={29 + (n % 2) * 65} r="8" fill="#25235e" />
              </g>
            ))}
          </>
        ) : ["adventure", "rpg", "quiz", "simulation"].includes(engine) ? (
          <>
            <rect
              x="42"
              y="28"
              width="100"
              height="100"
              rx="12"
              fill="#f9dde8"
            />
            <rect
              x="180"
              y="48"
              width="95"
              height="95"
              rx="10"
              fill="#8f9bb9"
            />
            <circle cx="210" cy="78" r="19" fill="#ffb21f" />
            <path
              d="M160 20v135m-30-30h120"
              stroke="#25235e"
              strokeDasharray="5 7"
              fill="none"
            />
          </>
        ) : (
          <>
            <path
              d={`M0 140H80V${100 + (seed % 30)}H150V140H220V90H320`}
              fill="none"
              stroke="#8f9bb9"
              strokeWidth="18"
            />
            <path
              d="M75 65q60-80 120 15"
              fill="none"
              stroke="#25235e"
              strokeDasharray="5 6"
            />
            {[40, 160, 275].map((x, n) => (
              <circle
                key={x}
                cx={x}
                cy={40 + (n % 2) * 45}
                r="8"
                fill="#ffb21f"
              />
            ))}
          </>
        )}
      </svg>
      <SucukMark className="art-cat" />
    </div>
  );
}
