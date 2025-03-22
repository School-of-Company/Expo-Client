import { ExpoItem } from '@/shared/types/main/type';

export const sortExpoList = (
  expoList: ExpoItem[] | undefined,
  filterValue: string,
): ExpoItem[] => {
  if (!expoList) return [];
  return filterValue === '오래된순' ? [...expoList].reverse() : expoList;
};
