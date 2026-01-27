export function generateLeadCsvHeaders(config: any): string[] {
  const headers: string[] = [];

  Object.entries(config.standardFields).forEach(
    ([key, enabled]) => {
      if (enabled) headers.push(key);
    }
  );

  config.customFields.forEach((field: any) => {
    if (!field.archived) headers.push(field.label);
  });

  return headers;
}
