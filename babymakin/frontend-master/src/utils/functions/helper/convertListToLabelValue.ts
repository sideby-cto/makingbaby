export function convertListToLabelValue(
  data: any,
  label: string,
  value: string,
  ref?: any
) {
  if (!data) return [];
  const transformed = data.map((option: any) => {
    const optionLabel = option[label];
    const optionValue = value !== "this" ? option[value] : option;
    if (ref) {
      const refValue = ref !== "this" ? option[ref] : option;
      return {
        label: optionLabel,
        value: optionValue,
        ref: refValue,
      } as LabelValueRef;
    }
    return { label: optionLabel, value: optionValue };
  });
  return transformed as LabelValue[];
}
