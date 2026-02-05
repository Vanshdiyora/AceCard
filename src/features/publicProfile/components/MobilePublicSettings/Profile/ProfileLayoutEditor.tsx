import {
    AlignLeft,
    AlignCenter,
    AlignRight,
} from "lucide-react";
import { Switch } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import React from "react";

function MobileColorPicker({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const hiddenInputRef = React.useRef<HTMLInputElement>(null);

    const openPicker = () => {
        // 1) scroll picker into center
        wrapperRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        // 2) lock background scroll
        document.body.style.overflow = "hidden";

        // 3) open native picker after scroll
        setTimeout(() => {
            hiddenInputRef.current?.focus(); // iOS fix
            hiddenInputRef.current?.click();
        }, 100);
    };

    const onClose = () => {
        document.body.style.overflow = "auto";
    };

    return (
        <div
            ref={wrapperRef}
            className="flex items-center justify-between gap-3 border rounded-xl p-2"
        >
            <span className="text-sm">{label}</span>

            <div className="flex items-center gap-2">
                {/* visible trigger */}
                <button
                    onClick={openPicker}
                    className="h-8 w-8 rounded-full border"
                    style={{ backgroundColor: value }}
                />

                <input
                    type="text"
                    value={value}
                    onFocus={openPicker}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-20 border rounded-md px-2 py-1 text-xs"
                />

                {/* hidden real picker */}
                <input
                    ref={hiddenInputRef}
                    type="color"
                    value={value}
                    onBlur={onClose}
                    onChange={(e) => onChange(e.target.value)}
                    className="fixed bottom-0 left-0 opacity-0"
                />
            </div>
        </div>
    );
}


const THEME_COLOR_KEYS = [
    "card_background",
    "button_color",
    "card_text",
    "button_text",
] as const;

function MobileThemeColorPicker({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 border rounded-xl p-2">
            <span className="text-sm capitalize">
                {label.replace("_", " ")}
            </span>

            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-8 w-8 rounded border"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-20 border rounded-md px-2 py-1 text-xs"
                />
            </div>
        </div>
    );
}

export function ProfileLayoutEditor({
    config,
    update,
    isLayoutLocked = false,
    uploadCustomFont,
    uploadImage,
}: any) {
    return (
        <div
            className={`space-y-6 ${isLayoutLocked ? "opacity-60 pointer-events-none" : ""
                }`}
        >
            {/* LAYOUT TYPE */}
            <div>
                <h4 className="text-sm font-semibold mb-2">Profile Layout</h4>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((t) => (
                        <button
                            key={t}
                            onClick={() =>
                                update({
                                    ...config,
                                    layout: { ...config.layout, profile_type: t },
                                })
                            }
                            className={`border rounded-xl p-2 transition ${config.layout?.profile_type === t
                                ? "border-black ring-2 ring-gray-300"
                                : "border-gray-200"
                                }`}
                        >
                            <img
                                src={
                                    t === 1
                                        ? "/profileLayout/profile-1.jpg"
                                        : t === 2
                                            ? "/profileLayout/profile-2.jpg"
                                            : "/profileLayout/profile-3.jpg"
                                }
                                className="w-full h-16 object-cover rounded"
                            />
                            <p className="text-xs text-center mt-1">
                                {t === 1 && "Profile Picture"}
                                {t === 2 && "Small Profile"}
                                {t === 3 && "Cover + Profile"}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* FADE */}
            {config.layout?.profile_type !== 2 && (
                <Switch
                    label="Fade cover"
                    value={!!config.layout?.is_fade}
                    onChange={(v: boolean) =>
                        update({
                            ...config,
                            layout: { ...config.layout, is_fade: v },
                        })
                    }
                />
            )}

            {/* FONT PICKER */}
            <div>
                <h4 className="text-sm font-medium mb-2">Font</h4>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        "Inter",
                        "Roboto",
                        "Montserrat",
                        "Merriweather",
                        "Caveat",
                        "Gloria Hallelujah",
                    ].map((font) => (
                        <button
                            key={font}
                            onClick={() =>
                                update({
                                    ...config,
                                    layout: { ...config.layout, font },
                                })
                            }
                            className={`border rounded-lg py-2 ${config.layout?.font === font
                                ? "border-black bg-gray-100"
                                : "border-gray-200"
                                }`}
                            style={{ fontFamily: font }}
                        >
                            {font}
                        </button>
                    ))}
                </div>
            </div>

            {/* CUSTOM FONT */}
            <Switch
                label="Use custom font"
                value={!!config.layout?.use_custom_font}
                onChange={(v) =>
                    update({
                        ...config,
                        layout: {
                            ...config.layout,
                            use_custom_font: v,
                            font: v ? "custom" : "Inter",
                        },
                    })
                }
            />

            {config.layout?.use_custom_font && (
                <label className="border px-3 py-2 rounded text-sm cursor-pointer inline-block">
                    Upload Font
                    <input
                        type="file"
                        hidden
                        accept=".ttf,.otf,.woff"
                        onChange={(e) =>
                            e.target.files && uploadCustomFont(e.target.files[0])
                        }
                    />
                </label>
            )}

            {/* ALIGNMENT */}
            <div>
                <h4 className="text-sm font-medium mb-2">Alignment</h4>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: "left", Icon: AlignLeft },
                        { id: "center", Icon: AlignCenter },
                        { id: "right", Icon: AlignRight },
                    ].map(({ id, Icon }) => (
                        <button
                            key={id}
                            onClick={() =>
                                update({
                                    ...config,
                                    layout: {
                                        ...config.layout,
                                        card_alignment: id,
                                    },
                                })
                            }
                            className={`border rounded-xl py-3 ${config.layout?.card_alignment === id
                                ? "border-black bg-gray-50"
                                : "border-gray-200"
                                }`}
                        >
                            <Icon className="mx-auto" />
                        </button>
                    ))}
                </div>
            </div>

            {/* BUTTON STYLE */}
            <div>
                <h4 className="text-sm font-medium mb-2">Button Style</h4>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((s) => (
                        <button
                            key={s}
                            onClick={() =>
                                update({
                                    ...config,
                                    layout: { ...config.layout, button_style: s },
                                })
                            }
                            className={`h-10 border ${config.layout?.button_style === s
                                ? "border-black"
                                : "border-gray-300"
                                }`}
                        >
                            <div
                                className={`mx-auto h-6 w-16 ${s === 2 ? "rounded-md" : s === 3 ? "rounded-full" : ""
                                    } border`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* PROFILE WIDTH */}
            <div>
                <h4 className="text-sm font-medium mb-2">Profile Width</h4>
                <input
                    type="number"
                    value={config.layout?.profile_width || ""}
                    onChange={(e) =>
                        update({
                            ...config,
                            layout: {
                                ...config.layout,
                                profile_width: Number(e.target.value || 0),
                            },
                        })
                    }
                    className="w-full border rounded p-2"
                />
            </div>

            {/* BACKGROUND TYPE */}
            <div>
                <h4 className="text-sm font-medium mb-2">Background</h4>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                        "solid",
                        "gradient",
                        "image",
                        "video",
                        "waves",
                        "polka",
                        "stripes",
                        "zigzag",
                    ].map((t) => (
                        <button
                            key={t}
                            onClick={() =>
                                update({
                                    ...config,
                                    layout: { ...config.layout, use_background: t },
                                })
                            }
                            className={`border rounded-lg py-2 text-xs capitalize ${config.layout?.use_background === t
                                ? "border-black bg-gray-50"
                                : "border-gray-200"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* SOLID COLOR */}
                {config.layout?.use_background === "solid" && (
                    <div className="mt-3">
                        <MobileColorPicker
                            label="Color"
                            value={config.layout?.color1 || "#000000"}
                            onChange={(v) =>
                                update({
                                    ...config,
                                    layout: { ...config.layout, color1: v },
                                })
                            }
                        />
                    </div>
                )}

                {/* GRADIENT */}
                {config.layout?.use_background === "gradient" && (
                    <div className="mt-3 space-y-2">
                        <MobileColorPicker
                            label="From"
                            value={config.layout?.color1 || "#7c3aed"}
                            onChange={(v) =>
                                update({
                                    ...config,
                                    layout: { ...config.layout, color1: v },
                                })
                            }
                        />

                        <MobileColorPicker
                            label="To"
                            value={config.layout?.color2 || "#6366f1"}
                            onChange={(v) =>
                                update({
                                    ...config,
                                    layout: { ...config.layout, color2: v },
                                })
                            }
                        />

                        <select
                            value={config.layout?.direction || "to-r"}
                            onChange={(e) =>
                                update({
                                    ...config,
                                    layout: { ...config.layout, direction: e.target.value },
                                })
                            }
                            className="w-full border rounded-lg p-2 text-sm"
                        >
                            <option value="to-r">Left → Right</option>
                            <option value="to-l">Right → Left</option>
                            <option value="to-b">Top → Bottom</option>
                            <option value="to-t">Bottom → Top</option>
                        </select>
                    </div>
                )}

                {/* PATTERN COLOR */}
                {["waves", "polka", "stripes", "zigzag"].includes(
                    config.layout?.use_background || ""
                ) && (
                        <div className="mt-3">
                            <MobileColorPicker
                                label="Pattern Color"
                                value={config.layout?.color1 || "#2f343a"}
                                onChange={(v) =>
                                    update({
                                        ...config,
                                        layout: { ...config.layout, color1: v },
                                    })
                                }
                            />
                        </div>
                    )}
            </div>


            {/* BG IMAGE */}
            {config.layout?.use_background === "image" && (
                <div className="border rounded-xl p-3 flex items-center gap-3">
                    {config.layout?.background_image ? (
                        <>
                            {/* PREVIEW */}
                            <div className="h-16 w-16 rounded-lg overflow-hidden border shrink-0">
                                <img
                                    src={config.layout.background_image}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* ACTIONS */}
                            <div className="flex-1 space-y-2">
                                <p className="text-xs font-medium">Background Image</p>

                                <div className="flex gap-2">
                                    <label className="flex-1 border rounded-lg py-1 text-xs text-center cursor-pointer hover:bg-gray-50">
                                        Replace
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const res = await uploadImage(file);

                                                update((prev: any) => ({
                                                    ...prev,
                                                    layout: {
                                                        ...prev.layout,
                                                        background_image: res.data.url,
                                                    },
                                                }));
                                            }}
                                        />
                                    </label>

                                    <button
                                        onClick={() =>
                                            update((prev: any) => ({
                                                ...prev,
                                                layout: { ...prev.layout, background_image: null },
                                            }))
                                        }
                                        className="flex-1 border border-red-300 text-red-600 rounded-lg py-1 text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <label className="w-full text-center border rounded-lg py-2 text-sm cursor-pointer">
                            Upload background image
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const res = await uploadImage(file);

                                    update((prev: any) => ({
                                        ...prev,
                                        layout: {
                                            ...prev.layout,
                                            background_image: res.data.url,
                                        },
                                    }));
                                }}
                            />
                        </label>
                    )}
                </div>
            )}

            {/* BG VIDEO */}
            {config.layout?.use_background === "video" && (
                <div className="border rounded-xl p-3 flex items-center gap-3">
                    {config.layout?.background_video ? (
                        <>
                            {/* PREVIEW */}
                            <div className="h-16 w-16 rounded-lg overflow-hidden border shrink-0 bg-black">
                                <video
                                    src={config.layout.background_video}
                                    muted
                                    autoPlay
                                    loop
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* ACTIONS */}
                            <div className="flex-1 space-y-2">
                                <p className="text-xs font-medium">Background Video</p>

                                <div className="flex gap-2">
                                    <label className="flex-1 border rounded-lg py-1 text-xs text-center cursor-pointer hover:bg-gray-50">
                                        Replace
                                        <input
                                            type="file"
                                            hidden
                                            accept="video/mp4,video/webm"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const res = await uploadImage(file);

                                                update((prev: any) => ({
                                                    ...prev,
                                                    layout: {
                                                        ...prev.layout,
                                                        background_video: res.data.url,
                                                    },
                                                }));
                                            }}
                                        />
                                    </label>

                                    <button
                                        onClick={() =>
                                            update((prev: any) => ({
                                                ...prev,
                                                layout: { ...prev.layout, background_video: null },
                                            }))
                                        }
                                        className="flex-1 border border-red-300 text-red-600 rounded-lg py-1 text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <label className="w-full text-center border rounded-lg py-2 text-sm cursor-pointer">
                            Upload background video
                            <input
                                type="file"
                                hidden
                                accept="video/mp4,video/webm"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const res = await uploadImage(file);

                                    update((prev: any) => ({
                                        ...prev,
                                        layout: {
                                            ...prev.layout,
                                            background_video: res.data.url,
                                        },
                                    }));
                                }}
                            />
                        </label>
                    )}
                </div>
            )}

            {/* ================= THEME ================= */}
            <div
                className={`relative ${config.theme.locked ? "opacity-60 pointer-events-none" : ""
                    }`}
            >
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    Theme Colors
                    {config.theme.locked && (
                        <span className="text-xs text-gray-500 font-normal">
                            (Locked)
                        </span>
                    )}
                </h4>

                <div className="space-y-2">
                    {THEME_COLOR_KEYS.map((key) => (
                        <MobileThemeColorPicker
                            key={key}
                            label={key}
                            value={config.theme?.[key] || "#000000"}
                            onChange={(val) =>
                                update({
                                    ...config,
                                    theme: {
                                        ...config.theme,
                                        [key]: val,
                                    },
                                })
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
