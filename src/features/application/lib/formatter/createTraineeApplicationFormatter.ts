import { slugify } from '@/shared/model';
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
    const nameField = dynamicFormItems.find(
      (item) => item.dynamicFormType === 'NAME',
    );
    const nameValue = nameField
      ? (data[slugify(nameField.title)] as string | undefined)
      : undefined;

    const phoneField = dynamicFormItems.find(
      (item) => item.dynamicFormType === 'PHONE_NUMBER',
    );
    const phoneValue = phoneField
      ? (data[slugify(phoneField.title)] as string | undefined)
      : undefined;

    const traineeIdField = dynamicFormItems.find(
      (item) => item.dynamicFormType === 'TRAINEE_ID',
    );
    const traineeIdValue = traineeIdField
      ? (data[slugify(traineeIdField.title)] as string | undefined)
      : undefined;

    const filteredFormItems = dynamicFormItems.filter(
      (item) =>
        !shouldExcludeTrainingProgramQuestion(item.title) &&
        item.dynamicFormType !== 'NAME' &&
        item.dynamicFormType !== 'PHONE_NUMBER' &&
        item.dynamicFormType !== 'TRAINEE_ID',
    );

    return {
      informationJson: JSON.stringify(
        processDynamicFormData(data, filteredFormItems),
      ),
      ...(data.privacyConsent !== undefined && {
        personalInformationStatus: data.privacyConsent,
      }),
      ...(nameValue && { name: nameValue }),
      ...(phoneValue && { phoneNumber: phoneValue }),
      ...(traineeIdValue && { trainingId: traineeIdValue }),
    };
  };
};
