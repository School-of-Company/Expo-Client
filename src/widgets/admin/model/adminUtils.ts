import { sortedData } from '@/shared/model/sortedData';
import { ExpoItem, SignUpItem } from '@/shared/types/admin/type';

export const getFilteredExpoList = (
  expoList: ExpoItem[],
  filterValue: string,
): Pick<
  ExpoItem,
  'id' | 'title' | 'description' | 'startedDay' | 'finishedDay'
>[] => {
  const sortedList = sortedData(expoList, filterValue);
  return sortedList.map(
    ({ id, title, description, startedDay, finishedDay }) => ({
      id,
      title,
      description,
      startedDay,
      finishedDay,
    }),
  );
};

export const getSortedRequestSignUp = (
  requestSignUp: SignUpItem[],
  filterValue: string,
): SignUpItem[] => {
  return sortedData(requestSignUp, filterValue);
};
