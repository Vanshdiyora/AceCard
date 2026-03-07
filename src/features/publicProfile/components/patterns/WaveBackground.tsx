import { useId } from "react";

export function WaveBackground({
  color,
}: {
  color: string;
}) {
  const id = useId();

  const g0 = `${id}-g0`;
  const g1 = `${id}-g1`;

  return (
    <svg
      viewBox="0 0 540 810"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={g0} gradientTransform="rotate(90)">
          <stop offset="5%" stopColor={color} stopOpacity="0.9" />
          <stop offset="95%" stopColor={color} stopOpacity="1" />
        </linearGradient>

        <linearGradient id={g1} gradientTransform="rotate(90)">
          <stop offset="1%" stopColor={color} stopOpacity="0.5" />
          <stop offset="95%" stopColor={color} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Base Background */}
      <rect width="100%" height="100%" fill={color} opacity={0.12} />

      <g transform="translate(0 90)">
        <g>
          {/* Wave 1 */}
          <path fill={`url(#${g0})`} opacity=".9" transform="translate(0 100)">
            <animate
              attributeName="d"
              dur="11s"
              repeatCount="indefinite"
              values="M 0,810 C 0,810 0,200 0,200 C 180,178 360,157 530,169 C 700,180 858,225 1008,236 C 1157,246 1298,223 1300,200 C 1300,200 1300,810 1300,810 Z;
                      M 0,810 C 0,810 0,200 0,200 C 112,226 224,253 395,240 C 565,226 793,174 977,161 C 1160,147 1300,173 1300,200 C 1300,200 1300,810 1300,810 Z;
                      M 0,810 C 0,810 0,200 0,200 C 180,178 360,157 530,169 C 700,180 858,225 1008,236 C 1157,246 1298,223 1300,200 C 1300,200 1300,810 1300,810 Z"
            />
          </path>

          {/* Wave 2 */}
          <path fill={`url(#${g1})`} opacity=".75" transform="translate(0 75)">
            <animate
              attributeName="d"
              dur="9s"
              repeatCount="indefinite"
              values="M 0,810 C 0,810 0,200 0,200 C 162,169 325,138 478,128 C 630,117 772,127 931,143 C 1089,158 1264,179 1300,200 C 1300,200 1300,810 1300,810 Z;
                      M 0,810 C 0,810 0,200 0,200 C 202,157 404,114 554,134 C 703,153 801,234 940,256 C 1078,277 1259,238 1300,200 C 1300,200 1300,810 1300,810 Z;
                      M 0,810 C 0,810 0,200 0,200 C 162,169 325,138 478,128 C 630,117 772,127 931,143 C 1089,158 1264,179 1300,200 C 1300,200 1300,810 1300,810 Z"
            />
          </path>

          {/* Wave 3 */}
          <path fill={`url(#${g0})`} opacity=".5" transform="translate(0 50)">
            <animate
              attributeName="d"
              dur="12s"
              repeatCount="indefinite"
              values="M 0,810 C 0,810 0,200 0,200 C 172,159 344,118 492,140 C 640,161 764,243 918,264 C 1072,284 1256,242 1300,200 C 1300,200 1300,810 1300,810 Z;
                      M 0,810 C 0,810 0,200 0,200 C 105,189 211,178 391,165 C 570,151 822,133 1010,139 C 1197,144 1318,172 1300,200 C 1300,200 1300,810 1300,810 Z;
                      M 0,810 C 0,810 0,200 0,200 C 172,159 344,118 492,140 C 640,161 764,243 918,264 C 1072,284 1256,242 1300,200 C 1300,200 1300,810 1300,810 Z"
            />
          </path>

          {/* Wave 4 */}
          <path fill={`url(#${g1})`} opacity=".25" transform="translate(0 25)">
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="M 0,810 C 0,810 0,200 0,200 C 130,201 261,203 437,192 C 612,180 831,156 1006,156 C 1180,155 1310,177 1300,200 C 1300,200 1300,810 1300,810 Z;
                      M 0,810 C 0,810 0,200 0,200 C 200,170 400,140 554,151 C 707,161 815,212 955,227 C 1094,241 1267,220 1300,200 C 1300,200 1300,810 1300,810 Z;
                      M 0,810 C 0,810 0,200 0,200 C 130,201 261,203 437,192 C 612,180 831,156 1006,156 C 1180,155 1310,177 1300,200 C 1300,200 1300,810 1300,810 Z"
            />
          </path>

          {/* Horizontal floating motion */}
          <animateTransform
            attributeName="transform"
            type="translate"
            dur="25s"
            repeatCount="indefinite"
            values="-200 0; -100 0; -200 0"
          />
        </g>
      </g>
    </svg>
  );
}
