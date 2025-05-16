import { slugify } from '@/shared/model/slugify';
import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from '../process/processDynamicFormData';

export const createStandardApplicationFormatter = (
  dynamicFormItems: DynamicFormItem[],
  applicationType?: 'register' | 'onsite',
) => {
  return (
    data: DynamicFormValues & { privacyConsent: boolean },
  ): FormattedApplicationData => {
    const nameKey = slugify('이름을 입력하세요');
    const phoneNumberKey = slugify('휴대폰 번호를 입력하세요');

    const name = String(data[nameKey] || '');

    const phoneNumberStatus = data['phoneNumberStatus'];
    const includePhoneNumber =
      applicationType !== 'onsite' || phoneNumberStatus === 'true';

    const phoneNumber = includePhoneNumber
      ? String(data[phoneNumberKey] || '')
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
