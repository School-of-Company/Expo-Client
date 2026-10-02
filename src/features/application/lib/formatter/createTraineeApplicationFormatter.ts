import { isTrainingProgramQuestion } from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from '../process/processDynamicFormData';
import { resolveFieldValue } from '../process/resolveFieldValue';

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
      ? (resolveFieldValue(data, nameField) as string | undefined)
      : undefined;

    const phoneField = dynamicFormItems.find(
      (item) => item.dynamicFormType === 'PHONE_NUMBER',
    );
    const phoneValue = phoneField
      ? (resolveFieldValue(data, phoneField) as string | undefined)
      : undefined;

    const traineeIdField = dynamicFormItems.find(
      (item) => item.dynamicFormType === 'TRAINEE_ID',
    );
    const traineeIdValue = traineeIdField
      ? (resolveFieldValue(data, traineeIdField) as string | undefined)
      : undefined;

    const filteredFormItems = dynamicFormItems.filter(
      (item) =>
        !isTrainingProgramQuestion(item.title) &&
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
