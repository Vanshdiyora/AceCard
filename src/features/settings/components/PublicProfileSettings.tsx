import { useState } from "react";

type VisibleFields = {
  name: boolean;
  photo: boolean;
  bio: boolean;
  contact: boolean;
  products: boolean;
};

const visibleKeys = [
  "name",
  "photo",
  "bio",
  "contact",
  "products",
] as const;

type DisplayMode = "carousel" | "grid" | "list";

export default function PublicProfileSettings() {
  const [visible, setVisible] = useState<VisibleFields>({
    name: true,
    photo: true,
    bio: true,
    contact: true,
    products: false,
  });

  const [display, setDisplay] = useState<DisplayMode>("carousel");
  const [theme, setTheme] = useState<string>("#7c3aed");

  return (
    <div className="bg-white shadow p-8 rounded-xl border">
      <h2 className="text-xl font-semibold mb-6">
        Public Profile Settings
      </h2>

      {/* Visible Fields */}
      <h3 className="font-semibold mb-3">Visible Fields</h3>
      {visibleKeys.map((key) => (
        <label key={key} className="flex items-center gap-2 mb-2 capitalize">
          <input
            type="checkbox"
            checked={visible[key]}
            onChange={() =>
              setVisible((prev) => ({
                ...prev,
                [key]: !prev[key],
              }))
            }
          />
          {key}
        </label>
      ))}

      {/* Product Display */}
      <h3 className="font-semibold mt-6 mb-2">Product Display</h3>
      <select
        className="border rounded-lg w-full px-3 py-2"
        value={display}
        onChange={(e) => setDisplay(e.target.value as DisplayMode)}
      >
        <option value="carousel">Carousel</option>
        <option value="grid">Grid</option>
        <option value="list">List</option>
      </select>

      {/* Theme Color */}
      <h3 className="font-semibold mt-6 mb-2">Theme</h3>
      <input
        type="color"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="w-16 h-10 rounded border"
      />

      <div className="mt-6 flex gap-3">
        <button className="px-6 py-2 bg-gray-300 rounded-lg">
          Preview
        </button>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg">
          Save
        </button>
      </div>
    </div>
  );
}
