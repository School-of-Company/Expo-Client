import { slugify } from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from '../process/processDynamicFormData';

export const createStandardApplicationFormatter = (
  dynamicFormItems: DynamicFormItem[],
) => {
  return (
    data: DynamicFormValues & { privacyConsent: boolean },
  ): FormattedApplicationData => {
    const nameField = dynamicFormItems.find((item) =>
      item.title.includes('이름'),
    );
    const nameValue = nameField
      ? (data[slugify(nameField.title)] as string | undefined)
      : undefined;

    return {
      informationJson: JSON.stringify(
        processDynamicFormData(data, dynamicFormItems),
      ),
      ...(data.privacyConsent !== undefined && {
        personalInformationStatus: data.privacyConsent,
      }),
      ...(nameValue && { name: nameValue }),
    };
  };
};
