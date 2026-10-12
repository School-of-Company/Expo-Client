import type { DynamicFieldRequest } from '@/shared/types/form/create/type';

/** 선택지를 가지는 필드 유형. 이 밖의 필드에는 `jsonData` 를 둘 수 없다. */
const OPTION_FIELD_TYPES = ['DROPDOWN', 'MULTIPLE'] as const;

/** 프로그램용 폼에서 쓸 수 없는 필드 유형(Expo-Form-Server#113). 이미지 업로드와 동행자·지역은 받지 않는다. */
const FORBIDDEN_FIELD_TYPES = ['IMAGE', 'COMPANION', 'REGION'] as const;

const hasOptions = (field: DynamicFieldRequest) =>
  Object.keys(field.jsonData ?? {}).length > 0;

/**
 * 프로그램용 폼으로 보낼 수 있는 모양인지 본다. 서버는 어긋나면 400 으로 거절하므로
 * 저장을 누르기 전에 같은 기준으로 먼저 막는다. 반환값이 비어 있으면 보낼 수 있다.
 */
export const validateProgramForm = (
  fields: DynamicFieldRequest[],
): string[] => {
  const problems: string[] = [];
  const seenTitles = new Set<string>();

  for (const field of fields) {
    const label = field.title?.trim() || '제목 없는 질문';

    if (FORBIDDEN_FIELD_TYPES.some((type) => type === field.formType)) {
      problems.push(
        `"${label}"의 ${field.formType} 유형은 프로그램용 폼에서 쓸 수 없습니다.`,
      );
    }

    if (field.otherJson?.hasEtc) {
      problems.push(
        `"${label}"의 기타 입력은 프로그램용 폼에서 쓸 수 없습니다.`,
      );
    }

    if (seenTitles.has(label)) {
      problems.push(`질문 제목 "${label}"이(가) 겹칩니다.`);
    }
    seenTitles.add(label);

    const isOptionField = OPTION_FIELD_TYPES.some(
      (type) => type === field.formType,
    );

    if (isOptionField && !hasOptions(field)) {
      problems.push(`"${label}"에 선택지를 하나 이상 추가해주세요.`);
    }

    if (!isOptionField && hasOptions(field)) {
      problems.push(`"${label}"은(는) 선택지를 가질 수 없는 질문입니다.`);
    }
  }

  return problems;
};
