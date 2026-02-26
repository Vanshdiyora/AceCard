import {
    AlignLeft,
    AlignCenter,
    AlignRight,
} from "lucide-react";
import { Switch } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import React from "react";
import { FontDropdown } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";

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
    "image_text_color"
] as const;

const THEME_COLOR_LABELS: Record<typeof THEME_COLOR_KEYS[number], string> = {
    card_background: "Card background",
    button_color: "Button color",
    card_text: "Card text",
    button_text: "Button text",
    image_text_color: "Image text",
};

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
                                        ? "/profileLayout/profile1.png"
                                        : t === 2
                                            ? "/profileLayout/profile2.png"
                                            : "/profileLayout/profile3.png"
                                }
                                className="w-full h-20 object-contain rounded-lg"
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
                <div className="mt-6 space-y-4">

                    {/* Fade Toggle */}
                    <div className="bg-white border rounded-2xl p-4">
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
                    </div>

                    {/* Fade Color */}
                    {config.layout?.is_fade && (
                        <div className="bg-gray-50 rounded-2xl p-4 border">
                            <MobileColorPicker
                                label="Fade color"
                                value={config.layout.fade_color ?? "#000000"}
                                onChange={(val: string) =>
                                    update({
                                        ...config,
                                        layout: { ...config.layout, fade_color: val },
                                    })
                                }
                            />
                        </div>
                    )}

                </div>
            )}

            <div className="mt-6">
                <label className="text-sm font-medium mb-2 block">
                    Choose a Font
                </label>

                <FontDropdown
                    value={config.layout.font}
                    onChange={(font: string) =>
                        update({
                            ...config,
                            layout: {
                                ...config.layout,
                                font,
                                use_custom_font: font === "custom",
                            },
                        })
                    }
                />

            </div>

            {config.layout.use_custom_font && (
                <div className="mt-4">
                    <label className="text-sm font-medium block mb-2">
                        Custom Font
                    </label>

                    <label
                        className="
        flex cursor-pointer items-center justify-between
        rounded-xl border border-dashed border-gray-300
        px-4 py-4 text-sm
        transition hover:border-gray-400 hover:bg-gray-50
      "
                    >
                        <div>
                            <p className="font-medium text-gray-700">
                                Upload font file
                            </p>
                            <p className="text-xs text-gray-500">
                                TTF, OTF, WOFF, WOFF2
                            </p>
                        </div>

                        <span className="
        rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white
      ">
                            Browse
                        </span>

                        <input
                            type="file"
                            hidden
                            accept=".ttf,.otf,.woff,.woff2"
                            onChange={(e) =>
                                e.target.files && uploadCustomFont(e.target.files[0])
                            }
                        />
                    </label>

                    {config.layout.custom_font && (
                        <p className="mt-2 text-xs text-green-600">
                            ✔ Font uploaded successfully
                        </p>
                    )}
                </div>
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
            <div className="mt-8">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
                    Button Style
                    <span className="text-gray-400 cursor-pointer">ⓘ</span>
                </h4>

                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((s) => {
                        const isActive = config.layout.button_style === s;

                        const shape =
                            s === 1
                                ? ""
                                : s === 2
                                    ? "rounded-md"
                                    : "rounded-full";

                        return (
                            <button
                                key={s}
                                onClick={() =>
                                    update({
                                        ...config,
                                        layout: { ...config.layout, button_style: s },
                                    })
                                }
                                className={`relative h-12 w-full border transition rounded-xl ${isActive
                                    ? "border-black ring-2 ring-gray-300"
                                    : "border-gray-300 hover:border-gray-400"
                                    }`}
                            >
                                {/* preview button */}
                                <div
                                    className={`absolute inset-2 ${shape} border border-gray-400 bg-gray-200`}
                                />

                            </button>
                        );
                    })}
                </div>
            </div>

            {/* PROFILE WIDTH */}
            <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Avatar Border Thickness</h4>

                <div className="flex items-center gap-3 w-1/2">
                    <input
                        type="number"
                        min={0}
                        max={600}
                        step={1}
                        value={
                            config.layout.profile_width === 0
                                ? ""
                                : config.layout.profile_width
                        }
                        onChange={(e) => {
                            const val = e.target.value;

                            // allow empty
                            if (val === "") {
                                update({
                                    ...config,
                                    layout: { ...config.layout, profile_width: 0 },
                                });
                                return;
                            }

                            update({
                                ...config,
                                layout: {
                                    ...config.layout,
                                    profile_width: Number(val),
                                },
                            });
                        }}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g. 360"
                    />

                    <span className="text-xs text-gray-500">px</span>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                    Recommended: 6 - 8 px
                </p>
            </div>

            {/* Border Radius */}
            <div className="mt-6">
                <div>
                    <h4 className="text-sm font-medium mb-3">Profile Size</h4>

                    <div className="flex items-center gap-3 w-1/2">
                        <input
                            type="number"
                            min={40}
                            max={80}
                            step={1}
                            value={
                                config.layout.profile_radius === 0
                                    ? ""
                                    : config.layout.profile_radius
                            }
                            onChange={(e) => {
                                const val = e.target.value;

                                if (val === "") {
                                    update({
                                        ...config,
                                        layout: { ...config.layout, profile_radius: 0 },
                                    });
                                    return;
                                }

                                update({
                                    ...config,
                                    layout: {
                                        ...config.layout,
                                        profile_radius: Number(val),
                                    },
                                });
                            }}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g. 50"
                        />

                        <span className="text-xs text-gray-500">px</span>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                        Recommended: 60 - 70 px
                    </p>
                </div>
            </div>

            {/* BACKGROUND TYPE */}
            <div>
                <h4 className="text-sm font-medium mb-2">Background</h4>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { id: "solid", label: "Solid" },
                        { id: "gradient", label: "Gradient" },
                        { id: "image", label: "Image" },
                        { id: "video", label: "Video" },
                        { id: "polka", label: "Polka" },
                        { id: "stripes", label: "Stripes" },
                        { id: "zigzag", label: "Zigzag" },
                    ].map((item) => {
                        const isActive = config.layout?.use_background === item.id;

                        return (
                            <div key={item.id} className="text-center">
                                <button
                                    type="button"
                                    onClick={() =>
                                        update({
                                            ...config,
                                            layout: {
                                                ...config.layout,
                                                use_background: item.id,
                                            },
                                        })
                                    }
                                    className={`
            relative w-full aspect-square rounded-2xl overflow-hidden
            border-2 transition-all duration-200
            ${isActive
                                            ? "border-black ring-2 ring-gray-300 scale-[1.02]"
                                            : "border-gray-200 active:scale-95"}
          `}
                                >
                                    {/* PREVIEW AREA */}

                                    {item.id === "solid" && (
                                        <div className="w-full h-full bg-gray-800" />
                                    )}

                                    {item.id === "gradient" && (
                                        <div className="w-full h-full bg-gradient-to-b from-gray-400 to-gray-800" />
                                    )}

                                    {item.id === "image" && (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                            Image
                                        </div>
                                    )}

                                    {item.id === "video" && (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                            Video
                                        </div>
                                    )}

                                    {["polka", "stripes", "zigzag"].includes(item.id) && (
                                        <img
                                            src={`/backgrounds/${item.id}.svg`}
                                            alt={item.label}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </button>

                                {/* LABEL */}
                                <p
                                    className={`mt-2 text-xs font-medium transition ${isActive ? "text-black" : "text-gray-500"
                                        }`}
                                >
                                    {item.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
                {/* SOLID COLOR */}
                {config.layout?.use_background === "solid" && (
                    <div className="mt-3">
                        <MobileColorPicker
                            label="Card Background Color"
                            value={config.layout?.background_color || "#000000"}
                            onChange={(v) =>
                                update({
                                    ...config,
                                    layout: { ...config.layout, background_color: v },
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
                                label="Pattern Background Color"
                                value={config.layout?.background_color || "#2f343a"}
                                onChange={(v) =>
                                    update({
                                        ...config,
                                        layout: { ...config.layout, background_color: v },
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
                className={`relative ${config.theme?.locked ? "opacity-60 pointer-events-none" : ""
                    }`}
            >
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    Theme Colors
                    {config.theme?.locked && (
                        <span className="text-xs text-gray-500 font-normal">
                            (Locked)
                        </span>
                    )}
                </h4>

                <div className="space-y-2">
                    {THEME_COLOR_KEYS.map((key) => (
                        <MobileThemeColorPicker
                            key={key}
                            label={THEME_COLOR_LABELS[key]}
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
