import { slugify } from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from '../process/processDynamicFormData';

export const createTraineeApplicationFormatter = (
  dynamicFormItems: DynamicFormItem[],
) => {
  return (
    data: DynamicFormValues & { privacyConsent: boolean },
  ): FormattedApplicationData => {
    const name = data[slugify('이름을 입력하세요')];
    const phoneNumber = data[slugify('휴대폰 번호를 입력하세요')];
    const trainingId = data[slugify('연수원 아이디를 입력하세요')];

    return {
      ...(name && { name: String(name) }),
      ...(phoneNumber && { phoneNumber: String(phoneNumber) }),
      ...(trainingId && { trainingId: String(trainingId) }),
      informationJson: JSON.stringify(
        processDynamicFormData(data, dynamicFormItems),
      ),
      ...(data.privacyConsent !== undefined && {
        personalInformationStatus: data.privacyConsent,
      }),
    };
  };
};
