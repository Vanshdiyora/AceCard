const SOURCE_MAP: Record<string, string> = {
  website: "manual",
  referral: "manual",
  google_ads: "manual",
  linkedin: "manual",
  import: "manual",
};

import { mapCustomFieldsFromCsv } from "./mapCustomFieldsFromCsv";

export function normalizeLeadCsvRow(
  row: Record<string, any>,
  leadConfig: any
) {
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

    // 🔥 DYNAMIC CUSTOM FIELDS
    custom_fields: mapCustomFieldsFromCsv(
      row,
      leadConfig?.custom_fields ?? []
    ),
  };
}
