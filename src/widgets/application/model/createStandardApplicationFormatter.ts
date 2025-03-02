import {
  DynamicFormItem,
  DynamicFormValues,
  StandardApplicationData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from './processDynamicFormData';
import { processSchoolLevel } from './processSchoolLevel';

export const createStandardApplicationFormatter = (
  dynamicFormItems: DynamicFormItem[],
) => {
  return (data: DynamicFormValues): StandardApplicationData => ({
    name: String(data['이름을 입력하세요'] || ''),
    phoneNumber: String(data['휴대폰 번호를 입력하세요'] || ''),
    affiliation: String(data['소속을 입력하세요'] || ''),
    schoolLevel: processSchoolLevel(data['학교급을 선택해주세요']),
    schoolDetail: String(data['학교이름을 입력해주세요'] || ''),
    personalInformationStatus: true,
    informationJson: JSON.stringify(
      processDynamicFormData(data, dynamicFormItems),
    ),
  });
};
