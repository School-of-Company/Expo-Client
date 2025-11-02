import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from '../process/processDynamicFormData';

const shouldExcludeTrainingProgramQuestion = (title: string): boolean => {
  return title.includes('연수 프로그램을 선택해주세요');
};

export const createTraineeApplicationFormatter = (
  dynamicFormItems: DynamicFormItem[],
) => {
  return (
    data: DynamicFormValues & { privacyConsent: boolean },
  ): FormattedApplicationData => {
    const filteredFormItems = dynamicFormItems.filter(
      (item) => !shouldExcludeTrainingProgramQuestion(item.title),
    );

    return {
      informationJson: JSON.stringify(
        processDynamicFormData(data, filteredFormItems),
      ),
      ...(data.privacyConsent !== undefined && {
        personalInformationStatus: data.privacyConsent,
      }),
    };
  };
};
