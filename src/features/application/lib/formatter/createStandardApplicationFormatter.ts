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
    // 하이픈·공백을 지워 보낸다. 설문 제출도 같은 규칙으로 번호를 정리한다
    const rawPhone = phoneField
      ? resolveFieldValue(data, phoneField)
      : undefined;
    const phoneValue =
      typeof rawPhone === 'string' ? rawPhone.replace(/[\s-]/g, '') : undefined;

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
