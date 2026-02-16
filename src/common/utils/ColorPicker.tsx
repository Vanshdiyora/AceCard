import { HexColorInput, RgbaColorPicker } from "react-colorful";
import { useMemo, useState } from "react";

type RGBA = { r: number; g: number; b: number; a: number };

function hexToRgba(hex: string, a = 1): RGBA {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
    a,
  };
}

function rgbaToHex({ r, g, b }: RGBA) {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

const SWATCHES = [
  "#C0392B","#E67E22","#F1C40F","#8E5A2A","#2ECC71","#27AE60",
  "#9B59B6","#8E44AD","#3498DB","#1ABC9C","#A3E635","#000000",
  "#4B5563","#9CA3AF","#FFFFFF"
];

export function ProColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const [rgba, setRgba] = useState<RGBA>(() =>
    hexToRgba(value || "#4D00D4", 1)
  );

  // Sync when external value changes
  useMemo(() => {
    const next = hexToRgba(value || "#4D00D4", rgba.a ?? 1);
    setRgba(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setRGBA = (next: RGBA) => {
    setRgba(next);
    onChange(rgbaToHex(next));
  };

  return (
    <div className="w-[280px] rounded-2xl pr-4 pt-3 space-y-4">
      {/* COLOR AREA */}
      <div className="rounded-xl overflow-hidden">
        <RgbaColorPicker color={rgba} onChange={setRGBA} />
      </div>

      {/* INPUTS */}
      <div className="grid grid-cols-5 gap-2 text-xs">
        <div className="col-span-2">
          <label className="text-gray-500 block mb-1">Hex</label>
          <HexColorInput
            prefixed
            color={value}
            onChange={(hex) => onChange(hex.toUpperCase())}
            className="w-full h-8 px-2 border rounded-md text-sm focus:ring-1 focus:ring-purple-500 outline-none"
          />
        </div>

        {(["r", "g", "b", "a"] as const).map((k) => (
          <div key={k}>
            <label className="text-gray-500 uppercase block mb-1">
              {k}
            </label>
            <input
              type="number"
              min={k === "a" ? 0 : 0}
              max={k === "a" ? 1 : 255}
              step={k === "a" ? 0.01 : 1}
              value={(rgba as any)[k]}
              onChange={(e) =>
                setRGBA({ ...rgba, [k]: Number(e.target.value) })
              }
              className="w-full h-8 px-2 border rounded-md text-sm focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>
        ))}
      </div>

      {/* SWATCHES */}
      <div className="grid grid-cols-8 gap-2 pt-1">
        {SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`
              h-6 w-6 rounded-md border
              transition hover:scale-105
              ${value.toUpperCase() === c ? "ring-2 ring-black" : ""}
            `}
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
