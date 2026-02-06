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

    const [touched, setTouched] = useState({
        visitor_name: false,
        visitor_phone: false,
        visitor_email: false,
    });

    const errors = {
        visitor_name: !form.visitor_name.trim()
            ? "Name is required"
            : "",
        visitor_phone: !form.visitor_phone.trim()
            ? "Mobile number is required"
            : "",
        visitor_email: !form.visitor_email.trim()
            ? "Email address is required"
            : "",
    };

    const isValid = !errors.visitor_name &&
        !errors.visitor_phone &&
        !errors.visitor_email;

    if (!open) return null;

    const submit = () => {
        if (!isValid) {
            setTouched({
                visitor_name: true,
                visitor_phone: true,
                visitor_email: true,
            });
            return;
        }

        dispatch(sendConnectRequest({ handle, payload: form }));

        // ✅ RESET FORM
        setForm({
            visitor_name: "",
            visitor_phone: "",
            visitor_email: "",
            message: "",
        });

        // ✅ RESET ERROR STATE
        setTouched({
            visitor_name: false,
            visitor_phone: false,
            visitor_email: false,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
            {/* CARD */}
            <div
                className="w-full max-w-sm rounded-2xl shadow-2xl p-5"
                style={{ backgroundColor: theme.card_background }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3
                        className="text-base font-semibold"
                        style={{ color: theme.card_text }}
                    >
                        Connect
                    </h3>

                    <button
                        onClick={onClose}
                        className="text-lg"
                        style={{ color: theme.card_text }}
                    >
                        ✕
                    </button>
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                    {/* Name */}
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name *"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: theme.button_color ?? "#fff",
                                color: theme.button_text ?? "#000",
                            }}
                            value={form.visitor_name}
                            onChange={(e) =>
                                setForm({ ...form, visitor_name: e.target.value })
                            }
                            onBlur={() =>
                                setTouched({ ...touched, visitor_name: true })
                            }
                        />
                        {touched.visitor_name && errors.visitor_name && (
                            <p className="text-xs mt-1 text-red-500">
                                {errors.visitor_name}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <input
                            type="tel"
                            placeholder="Mobile Number *"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: theme.button_color ?? "#fff",
                                color: theme.button_text ?? "#000",
                            }}
                            value={form.visitor_phone}
                            onChange={(e) =>
                                setForm({ ...form, visitor_phone: e.target.value })
                            }
                            onBlur={() =>
                                setTouched({ ...touched, visitor_phone: true })
                            }
                        />
                        {touched.visitor_phone && errors.visitor_phone && (
                            <p className="text-xs mt-1 text-red-500">
                                {errors.visitor_phone}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address *"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: theme.button_color ?? "#fff",
                                color: theme.button_text ?? "#000",
                            }}
                            value={form.visitor_email}
                            onChange={(e) =>
                                setForm({ ...form, visitor_email: e.target.value })
                            }
                            onBlur={() =>
                                setTouched({ ...touched, visitor_email: true })
                            }
                        />
                        {touched.visitor_email && errors.visitor_email && (
                            <p className="text-xs mt-1 text-red-500">
                                {errors.visitor_email}
                            </p>
                        )}
                    </div>

                    {/* Message */}
                    <textarea
                        placeholder="Your message (optional)"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                        style={{
                            backgroundColor: theme.button_color ?? "#fff",
                            color: theme.button_text ?? "#000",
                        }}
                        value={form.message}
                        onChange={(e) =>
                            setForm({ ...form, message: e.target.value })
                        }
                    />
                </div>

                {/* CTA */}
                <button
                    onClick={submit}
                    disabled={!isValid}
                    className={`w-full mt-5 py-3 rounded-xl font-semibold text-sm transition
            ${!isValid ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"}`}
                    style={{
                        backgroundColor: theme.button_color ?? "#fff",
                        color: theme.button_text ?? "#000",
                    }}
                >
                    Send Message
                </button>
            </div>
        </div>
    );
}
