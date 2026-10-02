import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedSurveyData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from '../process/processDynamicFormData';
import { resolveFieldValue } from '../process/resolveFieldValue';

export const createSurveyFormatter = (
  dynamicFormItems: DynamicFormItem[],
  queryPhoneNumber?: string | null,
): ((
  data: DynamicFormValues & { privacyConsent: boolean },
) => FormattedSurveyData) => {
  return (data) => {
    const phoneField = dynamicFormItems.find(
      (item) => item.dynamicFormType === 'PHONE_NUMBER',
    );

    const phoneNumber =
      queryPhoneNumber ||
      (phoneField ? String(resolveFieldValue(data, phoneField) || '') : '');

    return {
      phoneNumber,
      answerJson: JSON.stringify(
        processDynamicFormData(data, dynamicFormItems),
      ),
      personalInformationStatus: data.privacyConsent,
    };
  };
};
