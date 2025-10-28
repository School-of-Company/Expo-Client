import { slugify } from '@/shared/model';
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
    const name = data[slugify('이름을 입력하세요')];
    const phoneNumber = data[slugify('휴대폰 번호를 입력하세요')];
    const phoneNumberStatus = data['phoneNumberStatus'];
    const includePhoneNumber =
      applicationType !== 'onsite' || phoneNumberStatus === 'true';

    const filteredItems = dynamicFormItems.filter(
      (item) =>
        item.title !== '이름을 입력하세요' &&
        item.title !== '휴대폰 번호를 입력하세요',
    );

    return {
      ...(name && { name: String(name) }),
      ...(includePhoneNumber &&
        phoneNumber && { phoneNumber: String(phoneNumber) }),
      informationJson: JSON.stringify(
        processDynamicFormData(data, filteredItems),
      ),
      ...(data.privacyConsent !== undefined && {
        personalInformationStatus: data.privacyConsent,
      }),
    };
  };
};
