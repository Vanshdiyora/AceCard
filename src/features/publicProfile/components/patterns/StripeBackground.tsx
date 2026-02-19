import { useId } from "react";

export function StripeBackground({
  color,
}: {
  color: string;
}) {
  const patternId = useId();

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={patternId}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(135)"
        >
          {/* Stripe block */}
          <rect
            x="0"
            y="0"
            width="20"
            height="40"
            fill="white"
            opacity="0.25"   // 🔥 stripe opacity (adjust here)
          />

          {/* Movement */}
          <animateTransform
            attributeName="patternTransform"
            type="translate"
            from="0 0"
            to="40 0"
            dur="2s"
            repeatCount="indefinite"
            additive="sum"
          />
        </pattern>
      </defs>

      {/* Base background */}
      <rect width="100%" height="100%" fill={color} />

      {/* Stripes overlay */}
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
