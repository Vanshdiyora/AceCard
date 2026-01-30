import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { sendConnectRequest } from "../slice";

export function ConnectModal({ open, onClose, handle, theme }: any) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    visitor_name: "",
    visitor_phone: "",
    visitor_email: "",
    message: "",
  });

  if (!open) return null;

  const submit = () => {
    dispatch(sendConnectRequest({ handle, payload: form }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div
        className="w-[90%] rounded-2xl p-4"
        style={{ backgroundColor: theme.card_color }}
      >
        <div className="flex justify-between mb-3">
          <h3 style={{ color: theme.text_color }} className="font-semibold">
            Please fill the form
          </h3>
          <button onClick={onClose}>✕</button>
        </div>

        {["Name", "Mobile", "Email"].map((p, i) => (
          <input
            key={p}
            placeholder={p}
            className="w-full mb-2 p-2 rounded border"
            style={{
              backgroundColor: theme.background_color,
              color: theme.text_color,
              borderColor: theme.accent_color,
            }}
            onChange={e =>
              setForm({ ...form, [Object.keys(form)[i]]: e.target.value })
            }
          />
        ))}

        <textarea
          placeholder="Message"
          className="w-full mb-3 p-2 rounded border"
          style={{
            backgroundColor: theme.background_color,
            color: theme.text_color,
            borderColor: theme.accent_color,
          }}
          onChange={e => setForm({ ...form, message: e.target.value })}
        />

        <button
          onClick={submit}
          className="w-full py-2 rounded-xl"
          style={{
            backgroundColor: theme.primary_color,
            color: "#fff",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

