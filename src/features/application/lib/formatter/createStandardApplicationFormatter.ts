import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { processDynamicFormData } from '../process/processDynamicFormData';
import { resolveFieldValue } from '../process/resolveFieldValue';

export const createStandardApplicationFormatter = (
  dynamicFormItems: DynamicFormItem[],
  applicationType?: ApplicationType,
) => {
  return (
    data: DynamicFormValues & { privacyConsent: boolean },
  ): FormattedApplicationData => {
    const processedData = processDynamicFormData(data, dynamicFormItems);

    const nameField = dynamicFormItems.find(
      (item) => item.dynamicFormType === 'NAME',
    );

    const phoneField = dynamicFormItems.find(
      (item) => item.dynamicFormType === 'PHONE_NUMBER',
    );
    const phoneValue = phoneField
      ? (resolveFieldValue(data, phoneField) as string | undefined)
      : undefined;

    let nameValue: string | undefined;
    let informationJsonData = processedData;

    if (nameField) {
      nameValue = resolveFieldValue(data, nameField) as string | undefined;

      if (applicationType === 'FIELD') {
        const { [nameField.title]: _, ...rest } = processedData;
        informationJsonData = rest;
      }
    }

    return {
      informationJson: JSON.stringify(informationJsonData),
      ...(data.privacyConsent !== undefined && {
        personalInformationStatus: data.privacyConsent,
      }),
      ...(nameValue && { name: nameValue }),
      ...(phoneValue && { phoneNumber: phoneValue }),
    };
  };
};
