export function mapCustomFieldsFromCsv(
  row: Record<string, any>,
  customFields: Array<{
    key: string;
    label: string;
    type: string;
  }>
) {
  const result: Record<string, any> = {};

  for (const field of customFields) {
    const rawValue = row[field.label];

    if (rawValue == null || rawValue === "") continue;

    switch (field.type) {
      case "checkbox":
        result[field.key] = String(rawValue)
          .replace(/"/g, "")
          .split("|")
          .map(v => v.trim())
          .filter(Boolean);
        break;

      case "datetime":
        result[field.key] = new Date(rawValue).toISOString();
        break;

      case "number":
        result[field.key] = Number(rawValue);
        break;

      default:
        // text, dropdown, radio, etc.
        result[field.key] = rawValue;
    }
  }

  return result;
}
