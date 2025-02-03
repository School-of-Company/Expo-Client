export const preventEvent = (e: React.FormEvent | React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};
