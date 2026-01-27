import type { TabItem } from "../../../common/components/layout/PageFilter";

export function getStageTabs(config: any): TabItem[] {
  const stageField = config?.customFields?.find(
    (f: any) =>
      f.fieldId === "stage" &&
      f.type === "dropdown" &&
      !f.archived
  );

  if (!stageField) {
    return [{ label: "All", value: "all" }];
  }

  return [
    { label: "All", value: "all" },
    ...stageField.options.map((opt: any) => ({
      label: opt.label,
      value: opt.value,
    })),
  ];
}
