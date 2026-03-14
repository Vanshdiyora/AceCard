export const formatStage = (stage?: string | null): string => {
  if (!stage) return "—";

  return stage
    .replace(/_/g, " ")
    .split(" ")
    .map((word) =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};