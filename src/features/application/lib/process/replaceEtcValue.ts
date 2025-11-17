export const replaceEtcValue = (
  value: string | string[] | undefined,
  etcTextValue: string | undefined,
): string | string[] | undefined => {
  if (!etcTextValue) return value;

  if (Array.isArray(value))
    return value.map((v) => (v === '기타' ? etcTextValue : v));

  return value === '기타' ? etcTextValue : value;
};
