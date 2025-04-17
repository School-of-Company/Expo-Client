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
  ): FormattedApplicationData => {
    const name = String(data['이름을 입력하세요'] || '');

    const phoneNumberStatus = data['phoneNumberStatus'];
    const includePhoneNumber = phoneNumberStatus === 'true';
    const phoneNumber = includePhoneNumber
      ? String(data['휴대폰 번호를 입력하세요'] || '')
      : '';

    const informationJson = JSON.stringify(
      processDynamicFormData(data, dynamicFormItems),
    );

    const formattedData: FormattedApplicationData = {
      name,
      informationJson,
      personalInformationStatus: data.privacyConsent,
    };

    if (includePhoneNumber) {
      formattedData.phoneNumber = phoneNumber;
    }

    return formattedData;
  };
};
