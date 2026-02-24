export function validateField(
  field: any,
  value: any,
  form: any
): string | null {
  if (field.required) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return `${field.label} is required`;
    }
  }
  // ✅ Phone validation — digit count only (handles numeric values too)
  // ✅ Phone validation — must come BEFORE the number block
  const isPhoneField =
    field.type === "tel" ||
    /phone|mobile|contact/i.test(field.name) ||
    /phone|mobile|contact/i.test(field.label);

  if (isPhoneField && value !== null && value !== undefined && value !== "") {
    const digitsOnly = String(value).replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return `${field.label} must have between 10 and 15 digits`;
    }
    return null; // ✅ skip the number min/max check entirely for phone fields
  }

  if (typeof value === "number") {
    if (field.min !== undefined && value < field.min) {
      return `${field.label} must be at least ${field.min}`;
    }
    if (field.max !== undefined && value > field.max) {
      return `${field.label} must be at most ${field.max}`;
    }
  }

  if (Array.isArray(value) && field.minItems) {
    if (value.length < field.minItems) {
      return `Select at least ${field.minItems} option(s)`;
    }
  }

  if (typeof value === "string") {
    if (field.minLength && value.length < field.minLength) {
      return `${field.label} must be at least ${field.minLength} characters`;
    }
    if (field.maxLength && value.length > field.maxLength) {
      return `${field.label} must be at most ${field.maxLength} characters`;
    }
  }

  if (field.pattern && !field.pattern.test(value)) {
    return `${field.label} is invalid`;
  }

  if (field.validate) {
    return field.validate(value, form);
  }

  return null;
}
