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
        <div className="fixed inset-0 z-[9999] bg-black/60">

            {/* top aligned container */}
            <div className="absolute top-36 left-1/2 -translate-x-1/2 w-full px-4">
                <div
                    className="mx-auto w-full max-w-sm rounded-2xl p-4 shadow-2xl"
                    style={{ backgroundColor: theme.card_color }}
                >
                    {/* header */}
                    <div className="flex justify-between mb-3">
                        <h3
                            style={{ color: theme.text_color }}
                            className="font-semibold"
                        >
                            Please fill the form
                        </h3>
                        <button
                            onClick={onClose}
                            style={{ color: theme.text_color }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* inputs */}
                    {[
                        { key: "visitor_name", label: "Name" },
                        { key: "visitor_phone", label: "Mobile" },
                        { key: "visitor_email", label: "Email" },
                    ].map(f => (
                        <input
                            key={f.key}
                            placeholder={f.label}
                            className="w-full mb-2 p-2 rounded border outline-none"
                            style={{
                                backgroundColor: theme.background_color,
                                color: theme.text_color,
                                borderColor: theme.accent_color,
                            }}
                            value={(form as any)[f.key]}
                            onChange={e =>
                                setForm({ ...form, [f.key]: e.target.value })
                            }
                        />
                    ))}

                    <textarea
                        placeholder="Message"
                        className="w-full mb-3 p-2 rounded border outline-none"
                        style={{
                            backgroundColor: theme.background_color,
                            color: theme.text_color,
                            borderColor: theme.accent_color,
                        }}
                        value={form.message}
                        onChange={e =>
                            setForm({ ...form, message: e.target.value })
                        }
                    />

                    {/* submit */}
                    <button
                        onClick={submit}
                        className="w-full py-2 rounded-xl font-semibold"
                        style={{
                            backgroundColor: theme.primary_color,
                            color: "#fff",
                        }}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
