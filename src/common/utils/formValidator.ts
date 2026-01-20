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

  if (typeof value === "number") {
    if (field.min !== undefined && value < field.min) {
      return `${field.label} must be at least ${field.min}`;
    }
    if (field.max !== undefined && value > field.max) {
      return `${field.label} must be at most ${field.max}`;
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
