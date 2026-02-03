import { useEffect, useState } from "react";
import { Link2, FileText, Pencil, Check } from "lucide-react";
import LinksFilesSection from "../../../../teams/components/details/publicProfile/sections/LinksFilesSection";
import { Section, resolveTheme } from "../MobilePublicSettings";

function Links({ items, theme, editable = false, onChange }: any) {
    if (!items?.length && !editable) return null;

    const t = resolveTheme(theme);
    const [isEditing, setIsEditing] = useState(false);

    // local buffer so view never updates until Save
    const [buffer, setBuffer] = useState<any[]>(items || []);

    useEffect(() => {
        if (!isEditing) setBuffer(items || []);
    }, [items, isEditing]);

    return (
        <Section
            title={
                <div className="flex items-center justify-between w-full">
                    <span>Links & Files</span>

                    {editable && (
                        <button
                            onClick={() => {
                                if (isEditing) onChange?.(buffer);
                                setIsEditing((v) => !v);
                            }}
                            className={`h-9 w-9 rounded-full flex items-center justify-center shadow transition hover:scale-105 ${isEditing
                                    ? "bg-green-500 text-white"
                                    : "bg-orange-500 text-white"
                                }`}
                            title={isEditing ? "Save" : "Edit"}
                        >
                            {isEditing ? (
                                <Check size={16} />
                            ) : (
                                <Pencil size={16} />
                            )}
                        </button>

                    )}
                </div>
            }
            theme={theme}
        >

            {/* ===== LIVE RESULT ===== */}
            <div className="mt-3 flex flex-col gap-4">
                {buffer
                    .filter((l: any) => l.enabled)
                    .sort((a: any, b: any) => a.rank - b.rank)
                    .map((l: any) => (
                        <a
                            key={l.id}
                            href={l.url || l.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl p-2 transition hover:scale-[1.01]"
                        >
                            <div
                                className="h-9 w-9 rounded-full flex items-center justify-center shadow"
                                style={{
                                    backgroundColor: t.buttonBg,
                                    color: t.buttonText,
                                }}
                            >
                                {l.type === "file" ? (
                                    <FileText size={16} />
                                ) : (
                                    <Link2 size={16} />
                                )}
                            </div>

                            <p
                                className="text-sm font-semibold truncate"
                                style={{ color: t.text }}
                            >
                                {l.title || "Untitled"}
                            </p>
                        </a>
                    ))}
            </div>
            {/* ===== EDIT FORM ===== */}
            {isEditing && (
                <div className="mt-3 p-3 rounded-xl border border-dashed bg-white/70">
                    <LinksFilesSection
                        value={{ items: buffer }}
                        onChange={(v) => setBuffer(v.items)}
                    />
                </div>
            )}

        </Section>

    );
}

export default Links;
