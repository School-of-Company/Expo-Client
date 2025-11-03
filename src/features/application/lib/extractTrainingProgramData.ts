import { getTrainingProgram } from '@/shared/api';
import { slugify } from '@/shared/model';
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
  const trainingProId: number[] = [];

  const programs = await getTrainingProgram(exhibitionId);

  const trainingProgramForms = dynamicFormItems.filter((form) =>
    form.title.includes('연수 프로그램을 선택해'),
  );

  for (const form of trainingProgramForms) {
    const slug = slugify(form.title);
    const value = data[slug];

    if (value && Array.isArray(value)) {
      for (const programTitle of value) {
        const program = programs.find(
          (p) =>
            p.title === programTitle ||
            programTitle.includes(p.title) ||
            p.title.includes(programTitle),
        );

        if (program) {
          trainingProId.push(program.id);
        }
      }
    }
  }

  if (trainingProId.length > 0) {
    return {
      informationJson: formattedData.informationJson,
      personalInformationStatus:
        formattedData.personalInformationStatus ?? false,
      trainingProId,
    };
  }

  return null;
};
