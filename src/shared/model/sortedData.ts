export const sortedData = <T>(
  list: T[] | undefined,
  filterValue: string,
): T[] => {
  if (!list) return [];
  return filterValue === '오래된순' ? [...list].reverse() : list;
};
