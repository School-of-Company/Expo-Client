import { getTrainingProgram } from '@/shared/api';
import { slugify } from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { TrainingProgramSelectionRequest } from '../api/postTrainingProgramSelection';

export const extractTrainingProgramData = async (
  data: DynamicFormValues,
  dynamicFormItems: DynamicFormItem[],
  exhibitionId: string,
): Promise<TrainingProgramSelectionRequest | null> => {
  let trainingId: string | null = null;
  const trainingProIds: number[] = [];

  const trainingIdForm = dynamicFormItems.find((form) =>
    form.title.includes('연수원 아이디'),
  );

  if (trainingIdForm) {
    const slug = slugify(trainingIdForm.title);
    const value = data[slug];
    trainingId = String(value || '');
  }

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
          trainingProIds.push(program.id);
        }
      }
    }
  }

  if (trainingId && trainingProIds.length > 0) {
    return { trainingId, trainingProIds };
  }

  return null;
};
