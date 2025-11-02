import { slugify } from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { TrainingProgramSelectionRequest } from '../api/postTrainingProgramSelection';

export const extractTrainingProgramData = (
  data: DynamicFormValues,
  dynamicFormItems: DynamicFormItem[],
): TrainingProgramSelectionRequest | null => {
  let trainingId: string | null = null;
  let trainingProId: number[] = [];

  const trainingIdForm = dynamicFormItems.find((form) =>
    form.title.includes('연수원 아이디'),
  );

  if (trainingIdForm) {
    const slug = slugify(trainingIdForm.title);
    const value = data[slug];
    trainingId = String(value || '');
  }

  const trainingProgramForm = dynamicFormItems.find((form) =>
    form.title.includes('연수 프로그램을 선택해주세요'),
  );

  if (trainingProgramForm) {
    const slug = slugify(trainingProgramForm.title);
    const value = data[slug];

    if (Array.isArray(value)) {
      trainingProId = value.map((v) => Number(v)).filter((n) => !isNaN(n));
    } else if (value) {
      const num = Number(value);
      if (!isNaN(num)) {
        trainingProId = [num];
      }
    }
  }

  if (trainingId && trainingProId.length > 0) {
    return { trainingId, trainingProId };
  }

  return null;
};
