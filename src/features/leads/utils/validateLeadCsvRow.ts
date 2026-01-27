export function validateLeadCsvRow(
  row: Record<string, string>,
  config: any
): string[] {
  const errors: string[] = [];

  // Standard fields
  Object.entries(config.standardFields).forEach(
    ([key, required]) => {
      if (required && !row[key]) {
        errors.push(`${key} is required`);
      }
    }
  );

  // Custom fields
  config.customFields.forEach((field: any) => {
    if (field.archived) return;

    const value = row[field.label];

    if (field.required && !value) {
      errors.push(`${field.label} is required`);
      return;
    }

    if (value && field.options) {
      const allowed = field.options.map((o: any) => o.value);
      const values =
        field.type === "checkbox"
          ? value.split("|")
          : [value];

      values.forEach((v: string) => {
        if (!allowed.includes(v)) {
          errors.push(
            `${field.label}: invalid value "${v}"`
          );
        }
      });
    }
  });

  return errors;
}
