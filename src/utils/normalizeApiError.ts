export function normalizeApiError(msg: string) {
  const map: Record<string, string> = {
    "products: only vendor can modify a fully locked section":
      "You can’t edit the Products section because it is locked by your vendor.",
    "theme: only vendor can modify a fully locked section":
      "The theme is locked by your vendor and cannot be changed.",
    "layout: only vendor can modify a fully locked section":
      "The layout is locked and cannot be edited.",
    "banner: only vendor can modify a fully locked section":
      "The banner section is locked by your vendor.",
  };

  return map[msg] || msg;
}
