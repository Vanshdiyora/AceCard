const SOURCE_MAP: Record<string, string> = {
  website: "manual",
  referral: "manual",
  google_ads: "manual",
  linkedin: "manual",
  import: "manual",
};

export function normalizeLeadCsvRow(row: any) {
  const rawSource = row.leadSource?.toLowerCase();

  return {
    lead_name:
      row.firstName && row.lastName
        ? `${row.firstName} ${row.lastName}`
        : row.firstName || row.lastName || "Imported Lead",

    phone: row.phone || undefined,
    email: row.email || undefined,
    company: row.company || undefined,

    stage: row.stage || row.Stage || "new",

    // ✅ FIXED SOURCE
    source: SOURCE_MAP[rawSource] || "manual",

    deal_amount: row.estimatedDealValue
      ? Number(row.estimatedDealValue)
      : 0,

    products: row.products
      ? row.products
          .split("|")
          .map((p: string) => Number(p))
          .filter(Boolean)
      : [],

    custom_fields: {
      testing_text: row["Testing text"],
      testing_radio: row["Testing radio"],
      testing_dropdown: row["Testing Dropdown"],

      // ✅ FIX CHECKBOX BUG TOO
      test_checkbox: row["Test checkbox"]
        ? row["Test checkbox"]
            .replace(/"/g, "")
            .split("|")
        : [],

      test_datetime: row["Test Datetime"]
        ? new Date(row["Test Datetime"]).toISOString()
        : undefined,
    },
  };
}
