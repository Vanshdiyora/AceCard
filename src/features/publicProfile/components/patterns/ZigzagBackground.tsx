import { useId } from "react";

interface ZigzagBackgroundProps {
  color?: string;
}

export function ZigzagBackground({
  color = "#65696F",
}: ZigzagBackgroundProps) {
  const id = useId();
  const patternId = `${id}-zigzag-bg`;
  const pathId = `${id}-zigzag-path`;
function isDark(hex: string): boolean {
  const clean = hex.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;

  const num = parseInt(normalized, 16);

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.4;
}

function lightenHex(hex: string, ratio: number): string {
  const clean = hex.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;

  const num = parseInt(normalized, 16);

  const r = Math.min(255, Math.floor(((num >> 16) & 255) + 255 * ratio));
  const g = Math.min(255, Math.floor(((num >> 8) & 255) + 255 * ratio));
  const b = Math.min(255, Math.floor((num & 255) + 255 * ratio));

  return `rgb(${r}, ${g}, ${b})`;
}
const strokeColor = isDark(color)
  ? lightenHex(color, 0.35)
  : darkenHex(color, 0.15);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <defs>
        <path
          id={pathId}
          fill="none"
          stroke={strokeColor}
          strokeLinecap="square"
          strokeWidth={7} // thinner lines
          d="M-5 5 5.1 15 15 5l10 10"
        />

        {/* Smaller tile = less gap */}
        <pattern
          id={patternId}
          x="0"
          y="0"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          {/* Group 1 */}
          <g>
            <g>
              <use href={`#${pathId}`} transform="scale(6)" />
              <animateTransform
                attributeName="transform"
                dur="3s" // slower animation
                keyTimes="0;1"
                repeatCount="indefinite"
                type="translate"
                values="0 0; 0 120"
              />
            </g>
          </g>

          {/* Group 2 for seamless loop */}
          <g transform="translate(0 -120)">
            <g>
              <use href={`#${pathId}`} transform="scale(6)" />
              <animateTransform
                attributeName="transform"
                dur="3s"
                keyTimes="0;1"
                repeatCount="indefinite"
                type="translate"
                values="0 0; 0 120"
              />
            </g>
          </g>
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={color} />
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function darkenHex(hex: string, ratio: number): string {
  try {
    const clean = hex.replace("#", "");
    const normalized =
      clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;

    const num = parseInt(normalized, 16);
    if (isNaN(num)) return "rgba(0,0,0,0.4)";

    const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - ratio)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - ratio)));
    const b = Math.max(0, Math.floor((num & 0xff) * (1 - ratio)));

    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return "rgba(0,0,0,0.4)";
  }
}
