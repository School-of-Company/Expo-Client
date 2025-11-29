import { slugify } from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { processDynamicFormData } from '../process/processDynamicFormData';

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

    let nameValue: string | undefined;
    let informationJsonData = processedData;

    if (nameField) {
      nameValue = data[slugify(nameField.title)] as string | undefined;

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
    };
  };
};
