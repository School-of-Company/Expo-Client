import { SCHOOL_OCCUPATIONS } from '@/entities/form/constants/occupationData';
import {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { processDynamicFormData } from './processDynamicFormData';
import { processCompanions } from './processFormField';
import type { NewFieldParticipant } from '../../forms/api/fieldVisits';

const text = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

/**
 * 일반 현장등록 폼 답변을 방문일 API 의 최초등록 본문으로 옮긴다.
 * 대표자는 항상 신규 목록의 첫 항목이고 동행자가 그 뒤에 온다. 전화번호는 보내지 않는다(인증 세션이 정한다).
 * 대표자의 이름·직업·지역·소속이 폼에서 읽히지 않으면 빈 값으로 보내지 않고 오류를 돌려준다.
 */
export const buildFirstFieldVisit = (
  data: DynamicFormValues,
  items: DynamicFormItem[],
  newReference: () => string,
  references: string[] = [],
): { newParticipants: NewFieldParticipant[] } | { error: string } => {
  const find = (predicate: (item: DynamicFormItem) => boolean) =>
    items.find(predicate);
  const nameField = find((item) => item.dynamicFormType === 'NAME');
  const occupationField = find((item) => item.dynamicFormType === 'OCCUPATION');
  const regionField = find((item) => item.formType === 'REGION');
  const schoolField = find((item) => item.dynamicFormType === 'SCHOOL');
  const companionField = find((item) => item.formType === 'COMPANION');

  const name = nameField ? text(data[String(nameField.id)]) : '';
  const occupation = occupationField
    ? text(data[String(occupationField.id)])
    : '';
  const region = regionField ? text(data[String(regionField.id)]) : '';
  if (!name || !occupation || !region) {
    return { error: '대표자의 이름·직업·지역을 확인해주세요.' };
  }
  const needsSchool = SCHOOL_OCCUPATIONS.some((key) => key === occupation);
  const school = schoolField ? text(data[String(schoolField.id)]) : '';
  if (needsSchool && !school) {
    return { error: '대표자의 소속 학교를 입력해주세요.' };
  }

  // 대표자 답변에서 이름은 프로필 필드로, 동행자는 별도 참가자로 보내므로 뺀다
  const answers = processDynamicFormData(data, items);
  if (nameField) delete answers[nameField.title];
  if (companionField) delete answers[companionField.title];

  const companions = companionField
    ? processCompanions(data[String(companionField.id)])
    : [];
  while (references.length < companions.length + 1)
    references.push(newReference());

  return {
    newParticipants: [
      {
        clientReference: references[0],
        name,
        occupation,
        region,
        ...(needsSchool && { school }),
        informationJson: JSON.stringify(answers),
      },
      ...companions.map((companion, index) => ({
        clientReference: references[index + 1],
        name: companion.name,
        occupation: companion.occupation,
        region: companion.region,
        ...(companion.school && { school: companion.school }),
      })),
    ],
  };
};
