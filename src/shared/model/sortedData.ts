export const sortedData = <T>(
  list: T[] | undefined,
  filterValue: string,
): T[] => {
  if (!list) return [];
  return filterValue === '최신순' ? [...list].reverse() : list;
};
