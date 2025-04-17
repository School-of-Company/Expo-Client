import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from './processDynamicFormData';

export const createStandardApplicationFormatter = (
  dynamicFormItems: DynamicFormItem[],
) => {
  return (
    data: DynamicFormValues & { privacyConsent: boolean },
  ): FormattedApplicationData => ({
    name: String(data['이름을 입력하세요'] || ''),
    phoneNumber: String(data['휴대폰 번호를 입력하세요'] || ''),
    informationJson: JSON.stringify(
      processDynamicFormData(data, dynamicFormItems),
    ),
    personalInformationStatus: data.privacyConsent,
  });
};
