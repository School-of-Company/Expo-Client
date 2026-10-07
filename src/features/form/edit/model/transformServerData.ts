import type { ApplicationForm } from '@/shared/types/application/type';
import type {
  ConditionalSettings,
  FormValues,
  Option,
} from '@/shared/types/form/create/type';

/** 서버의 위치·키 참조를 빌더 내부의 UUID 참조로 바꾼다. `formUtils.toOtherJson`의 역방향. */
export const transformServerData = (
  data: ApplicationForm,
  mode: 'application' | 'survey',
): FormValues => {
  const items =
    (mode === 'application'
      ? data.dynamicForm
      : data.dynamicSurveyResponseDto) ?? [];

  const questions = items.map((item) => ({
    id: crypto.randomUUID(),
    options: Object.entries(item.jsonData).map(
      ([key, option]): Option =>
        typeof option === 'string'
          ? { id: crypto.randomUUID(), key, value: option }
          : {
              id: crypto.randomUUID(),
              key,
              value: option.value,
              isAlwaysSelected: option.isAlwaysSelected,
            },
    ),
  }));

  return {
    title: data.title || '',
    informationText: data.informationText || '',
    questions: items.map((item, index) => {
      const { maxSelection, conditional } = item.otherJson ?? {};
      const parent = conditional && questions[conditional.parentIndex];
      const idOf = (key: string) =>
        parent?.options.find((o) => o.key === key)?.id ?? key;

      const settings: ConditionalSettings = {
        ...(maxSelection && { maxSelection }),
        ...(parent && {
          conditional: conditional.triggerValues
            ? {
                parentId: parent.id,
                triggerValues: conditional.triggerValues.map(idOf),
              }
            : {
                parentId: parent.id,
                triggerValue: idOf(conditional.triggerValue ?? ''),
              },
        }),
      };

      return {
        id: questions[index].id,
        // 키는 직업처럼 고정된 것만 남긴다. 나머지는 저장할 때 순서로 다시 매겨 새 선택지와 겹치지 않게 한다.
        options: questions[index].options.map(({ key, ...option }) =>
          item.dynamicFormType === 'OCCUPATION' ? { ...option, key } : option,
        ),
        title: item.title,
        formType: item.formType,
        requiredStatus: item.requiredStatus,
        otherJson: Object.keys(settings).length
          ? JSON.stringify(settings)
          : null,
        dynamicFormType: item.dynamicFormType || 'DEFAULT',
      };
    }),
  };
};
