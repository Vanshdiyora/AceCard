import { resolveTheme } from "../MobilePublicSettings";

export function EditableProducts({
  title,
  items,
  theme,
  showPrice,
  onEdit,
}: any) {
  if (!items?.length) return null;

  return (
    <div className="relative">
      <h3 className="text-sm font-semibold mb-2" style={{ color: resolveTheme(theme).text }}>
        {title || "Products"}
      </h3>

      {/* ✏️ */}
      <button
        onClick={onEdit}
        className="absolute -top-2 right-0 z-20 bg-black/70 text-white p-2 rounded-full shadow hover:scale-105"
      >
        ✏️
      </button>

      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
        {items.map((p: any) => (
          <div
            key={p.id}
            className="relative min-w-[220px] h-48 rounded-2xl overflow-hidden snap-start shadow-lg"
          >
            <img
              src={p.image_url || p.product_img_url}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h4 className="text-sm font-semibold text-white line-clamp-2">
                {p.name}
              </h4>
              {showPrice && (
                <p className="text-xs text-white">₹{p.price}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
