export const preventEvent = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};
