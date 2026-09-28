import { getTrainingProgram } from '@/shared/api';
import {
  extractTrainingProgramTitle,
  isTrainingProgramQuestion,
  slugify,
} from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { TrainingProgramSelectionRequest } from '../api/postTrainingProgramSelection';

export const extractTrainingProgramData = async (
  data: DynamicFormValues,
  dynamicFormItems: DynamicFormItem[],
  exhibitionId: string,
  formattedData: FormattedApplicationData,
): Promise<TrainingProgramSelectionRequest | null> => {
  const trainingProIds: number[] = [];

  const programs = await getTrainingProgram(exhibitionId);

  const trainingProgramForms = dynamicFormItems.filter((form) =>
    isTrainingProgramQuestion(form.title),
  );

  for (const form of trainingProgramForms) {
    const slug = slugify(form.title);
    const value = data[slug];

    if (value && Array.isArray(value)) {
      for (const programTitle of value) {
        const extractedTitle = extractTrainingProgramTitle(programTitle);
        const program = programs.find((p) => p.title === extractedTitle);

        if (program) {
          trainingProIds.push(program.id);
        }
      }
    }
  }

  if (trainingProIds.length > 0) {
    return {
      name: formattedData.name || '',
      phoneNumber: formattedData.phoneNumber || '',
      trainingId: formattedData.trainingId || '',
      informationJson: formattedData.informationJson,
      personalInformationStatus:
        formattedData.personalInformationStatus ?? false,
      trainingProId: trainingProIds,
    };
  }

  return null;
};
