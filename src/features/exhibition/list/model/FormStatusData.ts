import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ExpoItem } from '@/shared/types/admin/type';

interface ExpoValidationItem {
  expoId: string;
  standardFormCreatedStatus: boolean;
  traineeFormCreatedStatus: boolean;
  traineeSurveyCreatedStatus: boolean;
  standardSurveyCreatedStatus: boolean;
}

let cachedValidationItems: ExpoValidationItem[] | null = null;

const fetchExpoValidation = async (): Promise<ExpoValidationItem[] | null> => {
  try {
    const response = await clientTokenInstance.get('/expo/valid');
    return response.data.expoValid;
  } catch (error) {
    return null;
  }
};

export const FormStatusData = async (
  list: ExpoItem[] | undefined,
  filterValue: string,
  status: boolean,
): Promise<ExpoItem[]> => {
  if (!list) return [];

  if (!cachedValidationItems) {
    cachedValidationItems = await fetchExpoValidation();
  }

  if (!cachedValidationItems) return [];

  const validFields: (keyof ExpoValidationItem)[] = [
    'standardFormCreatedStatus',
    'traineeFormCreatedStatus',
    'standardSurveyCreatedStatus',
    'traineeSurveyCreatedStatus',
  ];

  if (validFields.includes(filterValue as keyof ExpoValidationItem)) {
    const validExpoIds = cachedValidationItems
      .filter(
        (item) => item[filterValue as keyof ExpoValidationItem] === status,
      )
      .map((item) => item.expoId);

    return list.filter((item) =>
      validExpoIds.includes(String(item.expoId ?? item.id ?? '')),
    );
  }

  return list;
};
