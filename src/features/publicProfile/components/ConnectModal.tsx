import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { sendConnectRequest } from "../slice";
import type { ContactConfig, ContactField} from "../../settings/components/vice/VicePublicSetting";

export function ConnectModal({
  open,
  onClose,
  handle,
  theme,
  config,
}: {
  open: boolean;
  onClose: () => void;
  handle: string;
  theme: any;
  config: ContactConfig;
}) {
  const dispatch = useAppDispatch();

  const enabledFields =
    config?.fields?.filter((f) => f.enabled) ?? [];

  /* ================= STATE ================= */

  const [form, setForm] = useState<Record<string, any>>(
    () =>
      Object.fromEntries(
        enabledFields.map((f) => [f.id, ""])
      )
  );

  const [touched, setTouched] = useState<Record<
    string,
    boolean
  >>({});

  const [submitted, setSubmitted] = useState(false);

  /* ================= VALIDATION ================= */

  const errors: Record<string, string> = {};

  enabledFields.forEach((field) => {
    if (
      field.required &&
      !form[field.id]?.toString().trim()
    ) {
      errors[field.id] = `${field.label} is required`;
    }
  });

  const isValid = Object.keys(errors).length === 0;

  if (!open) return null;

  /* ================= SUBMIT ================= */

  const submit = () => {
    if (!isValid) {
      const allTouched: Record<string, boolean> = {};
      enabledFields.forEach(
        (f) => (allTouched[f.id] = true)
      );
      setTouched(allTouched);
      return;
    }

    dispatch(
      sendConnectRequest({
        handle,
        payload: form,
      })
    );

    setSubmitted(true);
  };

  const closeAll = () => {
    setForm(
      Object.fromEntries(
        enabledFields.map((f) => [f.id, ""])
      )
    );
    setTouched({});
    setSubmitted(false);
    onClose();
  };

  /* ================= RENDER FIELD ================= */

  const renderField = (field: ContactField) => {
    const commonProps = {
      className:
        "w-full px-4 py-3 rounded-xl text-sm outline-none",
      style: {
        backgroundColor:
          theme.button_color ?? "#fff",
        color: theme.button_text ?? "#000",
      },
      value: form[field.id] ?? "",
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) =>
        setForm({
          ...form,
          [field.id]:
            field.type === "checkbox"
              ? (e.target as HTMLInputElement).checked
              : e.target.value,
        }),
      onBlur: () =>
        setTouched({
          ...touched,
          [field.id]: true,
        }),
    };

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            rows={3}
            placeholder={field.placeholder}
            {...commonProps}
          />
        );

      case "dropdown":
        return (
          <select {...commonProps}>
            <option value="">
              Select {field.label}
            </option>
            {(field.options ?? []).map(
              (opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              )
            )}
          </select>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form[field.id] ?? false}
              onChange={(e) =>
                setForm({
                  ...form,
                  [field.id]:
                    e.target.checked,
                })
              }
            />
            {field.label}
          </label>
        );

      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            {...commonProps}
          />
        );
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">

      {/* SUCCESS */}
      {submitted && (
        <div
          className="w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center"
          style={{
            backgroundColor:
              theme.card_background,
          }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{
              color: theme.card_text,
            }}
          >
            Message Sent
          </h3>

          <button
            onClick={closeAll}
            className="w-full py-3 rounded-xl font-semibold text-sm"
            style={{
              backgroundColor:
                theme.button_color ?? "#fff",
              color:
                theme.button_text ?? "#000",
            }}
          >
            Done
          </button>
        </div>
      )}

      {/* FORM */}
      {!submitted && (
        <div
          className="w-full max-w-sm rounded-2xl shadow-2xl p-5"
          style={{
            backgroundColor:
              theme.card_background,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-semibold"
              style={{
                color: theme.card_text,
              }}
            >
              {config?.form_title ||
                "Connect"}
            </h3>

            <button
              onClick={closeAll}
              className="text-lg"
              style={{
                color: theme.card_text,
              }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {enabledFields.map((field) => (
              <div key={field.id}>
                {field.type !==
                  "checkbox" && (
                  <label className="text-xs mb-1 block opacity-70">
                    {field.label}
                    {field.required && " *"}
                  </label>
                )}

                {renderField(field)}

                {touched[field.id] &&
                  errors[field.id] && (
                    <p className="text-xs mt-1 text-red-500">
                      {errors[field.id]}
                    </p>
                  )}
              </div>
            ))}
          </div>

          <button
            onClick={submit}
            disabled={!isValid}
            className={`w-full mt-5 py-3 rounded-xl font-semibold text-sm ${
              !isValid
                ? "opacity-50 cursor-not-allowed"
                : "active:scale-[0.98]"
            }`}
            style={{
              backgroundColor:
                theme.button_color ?? "#fff",
              color:
                theme.button_text ?? "#000",
            }}
          >
            {config?.connect_title ||
              "Send Message"}
          </button>
        </div>
      )}
    </div>
  );
}