export const isValidSrc = (src: string | null): boolean => {
  if (!src) return false;
  return (
    src.startsWith('/') ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('blob:')
  );
};
