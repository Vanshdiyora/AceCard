import type { FieldConfig } from "../ui/DynamicForm";

export function validateField(
  field: FieldConfig,
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

  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Invalid email address";
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
      return `${field.label} must be ≥ ${field.min}`;
    }
    if (field.max !== undefined && value > field.max) {
      return `${field.label} must be ≤ ${field.max}`;
    }
  }

  if (field.pattern && value && !field.pattern.test(value)) {
    return `${field.label} format is invalid`;
  }

  if (field.validate) {
    return field.validate(value, form);
  }

  return null;
}
