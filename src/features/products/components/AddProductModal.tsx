import { useState } from "react";
// import type { Product } from "../types";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddProductModal({ open, onClose, onSubmit }: AddProductModalProps) {

  // Required fields
  const [base, setBase] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    sku: ""
  });

  // Extra dynamic fields
  const [extraProps, setExtraProps] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" }
  ]);

  const handleBaseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBase({ ...base, [e.target.name]: e.target.value });
  };

  const handleExtraChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...extraProps];
    updated[index][field] = value;
    setExtraProps(updated);
  };

  const addField = () => {
    setExtraProps([...extraProps, { key: "", value: "" }]);
  };

  const removeField = (idx: number) => {
    setExtraProps(extraProps.filter((_, i) => i !== idx));
  };

  if (!open) return null;

  // Build final extra_properties object
  const finalExtra: Record<string, any> = {};
  extraProps.forEach((p) => {
    if (p.key.trim() !== "") finalExtra[p.key] = p.value;
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] space-y-4">

        <h2 className="text-xl font-semibold">Add Product</h2>

        {/* REQUIRED FIELDS */}
        <input
          name="name"
          placeholder="Product Name"
          value={base.name}
          onChange={handleBaseChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={base.price}
          onChange={handleBaseChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="category"
          placeholder="Category"
          value={base.category}
          onChange={handleBaseChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="sku"
          placeholder="SKU"
          value={base.sku}
          onChange={handleBaseChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={base.description}
          onChange={handleBaseChange}
          className="w-full border rounded-lg px-3 py-2 h-20"
        />

        {/* EXTRA FIELDS */}
        <h3 className="font-medium">Extra Properties</h3>

        {extraProps.map((prop, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              placeholder="Field name (e.g. Weight)"
              value={prop.key}
              onChange={(e) => handleExtraChange(idx, "key", e.target.value)}
              className="border rounded-lg px-3 py-2 w-1/2"
            />

            <input
              placeholder="Value"
              value={prop.value}
              onChange={(e) => handleExtraChange(idx, "value", e.target.value)}
              className="border rounded-lg px-3 py-2 w-1/2"
            />

            {extraProps.length > 1 && (
              <button
                className="text-red-500"
                onClick={() => removeField(idx)}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button onClick={addField} className="text-purple-600 font-medium">
          + Add another field
        </button>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            onClick={() =>
              onSubmit({
                ...base,
                price: Number(base.price),
                extra_properties: finalExtra
              })
            }
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Save Product
          </button>
        </div>

      </div>
    </div>
  );
}
