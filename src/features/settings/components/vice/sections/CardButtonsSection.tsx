import CommonItemsReorder from "./CommonItemsReorder";

export interface CardButtonItem {
  id: string;
  title: string;
  link: string;
  rank: number;
  enabled: boolean;
}

interface Props {
  value: {
    items: CardButtonItem[];
  };
  disabled?: boolean;
  onChange: (v: any) => void;
}

export default function CardButtonsSection({
  value,
  disabled,
  onChange,
}: Props) {
  const items = value.items || [];

  const addButton = () => {
    if (items.length >= 2) return;

    onChange({
      ...value,
      items: [
        ...items,
        {
          id: crypto.randomUUID(),
          title: "",
          link: "",
          rank: items.length + 1,
          enabled: true,
        },
      ],
    });
  };

  const updateItems = (updated: CardButtonItem[]) => {
    const withRank = updated.map((b, i) => ({
      ...b,
      rank: i + 1,
    }));

    onChange({
      ...value,
      items: withRank,
    });
  };

  return (
    <div className="space-y-6">
      <CommonItemsReorder
        items={items}
        onChange={updateItems}
        renderItem={(btn: CardButtonItem, index: number) => (
          <div
            className={`border rounded-xl p-4 space-y-4 ${
              disabled ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">
                Button {index + 1}
              </p>

              <button
                onClick={() =>
                  updateItems(
                    items.filter((b) => b.id !== btn.id)
                  )
                }
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500">
                Button Text
              </label>
              <input
                value={btn.title}
                onChange={(e) => {
                  const updated = [...items];
                  updated[index] = {
                    ...btn,
                    title: e.target.value,
                  };
                  updateItems(updated);
                }}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Enter button label"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500">
                Button Link
              </label>
              <input
                value={btn.link}
                onChange={(e) => {
                  const updated = [...items];
                  updated[index] = {
                    ...btn,
                    link: e.target.value,
                  };
                  updateItems(updated);
                }}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="https://example.com"
              />
            </div>
          </div>
        )}
      />

      {!disabled && items.length < 2 && (
        <button
          onClick={addButton}
          className="w-full border rounded-xl py-3 text-sm font-medium hover:bg-gray-50"
        >
          + Add Button
        </button>
      )}

      {items.length >= 2 && (
        <p className="text-xs text-gray-400 text-center">
          Maximum 2 buttons allowed
        </p>
      )}
    </div>
  );
}