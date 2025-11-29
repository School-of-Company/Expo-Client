import { slugify } from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedSurveyData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from '../process/processDynamicFormData';

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
      (phoneField ? String(data[slugify(phoneField.title)] || '') : '');

    return {
      phoneNumber,
      answerJson: JSON.stringify(
        processDynamicFormData(data, dynamicFormItems),
      ),
      personalInformationStatus: data.privacyConsent,
    };
  };
};
