export const processFormField = (
  title: string,
  value: unknown,
  formType: string,
): string => {
  if (
    value === undefined ||
    value === null ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return '';
  }

  if (formType === 'CHECKBOX' || formType === 'MULTIPLE') {
    const selectedOptions = Array.isArray(value) ? value : [value];
    return selectedOptions.map(String).join(', ');
  }

  return String(value || '').toUpperCase();
};
