import { useId } from "react";

export function PolkaBackground({
  color,
}: {
  color: string;
}) {
  const id = useId();

  const patternId = `${id}-circle`;
  const brickId = `${id}-brick`;
  const rowId = `${id}-row`;
  const rowOffsetId = `${id}-row-o`;

  return (
    <svg
      viewBox="0 0 270 405"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Smaller Circle Pattern */}
        <pattern
          id={patternId}
          width="40"     // 🔥 smaller spacing
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="20"
            cy="20"
            r="8"        // 🔥 smaller radius
            fill="white"
            opacity="0.25"
          >
            <animate
              attributeName="r"
              dur="2s"
              repeatCount="indefinite"
              values="6;9;6"   // 🔥 smaller pulse
            />
          </circle>
        </pattern>

        {/* Brick */}
        <rect
          id={brickId}
          width="40"
          height="40"
          fill={`url(#${patternId})`}
        />

        {/* Row */}
        <g id={rowId}>
          <use href={`#${brickId}`} />
          <use x="30" href={`#${brickId}`} />
          <use x="60" href={`#${brickId}`} />
          <use x="90" href={`#${brickId}`} />
          <use x="120" href={`#${brickId}`} />
          <use x="150" href={`#${brickId}`} />
          <use x="180" href={`#${brickId}`} />
          <use x="210" href={`#${brickId}`} />
          <use x="240" href={`#${brickId}`} />
        </g>

        {/* Offset Row */}
        <use
          id={rowOffsetId}
          x="-15"
          href={`#${rowId}`}
        />
      </defs>

      {/* Base Background */}
      <rect width="100%" height="100%" fill={color} />

      {/* Grid */}
      <g>
        <use href={`#${rowOffsetId}`} />
        <use y="30" href={`#${rowId}`} />
        <use y="60" href={`#${rowOffsetId}`} />
        <use y="90" href={`#${rowId}`} />
        <use y="120" href={`#${rowOffsetId}`} />
        <use y="150" href={`#${rowId}`} />
        <use y="180" href={`#${rowOffsetId}`} />
        <use y="210" href={`#${rowId}`} />
        <use y="240" href={`#${rowOffsetId}`} />
        <use y="270" href={`#${rowId}`} />
        <use y="300" href={`#${rowOffsetId}`} />
        <use y="330" href={`#${rowId}`} />
        <use y="360" href={`#${rowOffsetId}`} />
      </g>
    </svg>
  );
}
