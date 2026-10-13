import { getTrainingProgram } from '@/shared/api';
import {
  extractTrainingProgramTitle,
  isTrainingProgramQuestion,
} from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { TrainingProgramSelectionRequest } from '../api/postTrainingProgramSelection';
import { resolveFieldValue } from './process/resolveFieldValue';
import { resolveTrainingProgramIds } from './resolveTrainingProgramIds';

export const extractTrainingProgramData = async (
  data: DynamicFormValues,
  dynamicFormItems: DynamicFormItem[],
  exhibitionId: string,
  formattedData: FormattedApplicationData,
): Promise<TrainingProgramSelectionRequest> => {
  const selectedTitles = dynamicFormItems
    .filter((form) => isTrainingProgramQuestion(form.title))
    .flatMap((form) => {
      const value = resolveFieldValue(data, form);
      return Array.isArray(value) ? value : [];
    })
    .map(extractTrainingProgramTitle);

  const trainingProIds = resolveTrainingProgramIds(
    selectedTitles,
    selectedTitles.length > 0 ? await getTrainingProgram(exhibitionId) : [],
  );

  return {
    name: formattedData.name || '',
    phoneNumber: formattedData.phoneNumber || '',
    trainingId: formattedData.trainingId || '',
    informationJson: formattedData.informationJson,
    personalInformationStatus: formattedData.personalInformationStatus ?? false,
    trainingProIds,
  };
};
