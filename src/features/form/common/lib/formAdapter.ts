import {
  COMPANION_MAX_COUNT,
  REGION_OPTIONS,
} from '@/entities/form/constants/occupationData';
import { optionEntries } from '@/entities/form/registry/model';
import {
  FormSchema,
  FormItem,
  FormLogic,
} from '@/features/form/common/model/formSchema';
import { DynamicFormItem } from '@/shared/types/application/type';

/** 렌더러 필드 id. 서버 문항 id이고, 설문 답변(`answers`)의 키로도 쓴다. */
export const getFieldId = (item: DynamicFormItem) => String(item.id);

function mapFormType(formType: DynamicFormItem['formType']): FormItem['type'] {
  switch (formType) {
    case 'CHECKBOX':
      return 'CHECKBOX';
    case 'MULTIPLE':
      return 'MULTI_SELECT';
    case 'DROPDOWN':
    case 'REGION':
      return 'DROPDOWN';
    case 'COMPANION':
      return 'COMPANION';
    default:
      return 'TEXT';
  }
}

function adaptDynamicFormItem(
  item: DynamicFormItem,
  allItems: DynamicFormItem[],
): FormItem {
  const type = mapFormType(item.formType);
  const { conditional, maxSelection } = item.otherJson ?? {};

  // 선택지 값은 jsonData 키 그대로라 답변에 바로 실을 수 있다.
  // 지역은 선택지가 서버에 고정돼 jsonData가 비어 있으므로 클라이언트 목록을 쓴다.
  // 직업은 `optionEntries`가 고정 순서로 맞추고 교직원 같은 예전 선택지를 숨긴다.
  const entries: [string, string][] =
    item.formType === 'REGION'
      ? REGION_OPTIONS.map(({ key, label }) => [key, label])
      : optionEntries(item).map(({ key, label }) => [key, label]);
  const options =
    type === 'MULTI_SELECT' || type === 'DROPDOWN'
      ? entries.map(([key, label]) => ({ id: key, label, value: key }))
      : undefined;

  let logic: FormLogic | undefined;
  const parent = conditional && allItems[conditional.parentIndex];
  if (parent) {
    const fieldId = getFieldId(parent);
    const { triggerValues } = conditional;
    if (parent.formType === 'MULTIPLE' && triggerValues?.length) {
      // 복수 선택 답은 배열이라 `in`(답 하나가 목록에 있는지)으로는 맞지 않는다.
      // 고른 값 중 하나라도 trigger에 있으면 보이도록 contains를 OR로 묶는다.
      logic = {
        visibility: {
          op: 'OR',
          conditions: triggerValues.map((value) => ({
            fieldId,
            op: 'contains',
            value,
          })),
        },
      };
    } else {
      logic = {
        visibility: {
          op: 'AND',
          conditions: [
            triggerValues
              ? { fieldId, op: 'in', value: triggerValues }
              : {
                  fieldId,
                  op: parent.formType === 'MULTIPLE' ? 'contains' : 'eq',
                  value: conditional.triggerValue ?? '',
                },
          ],
        },
      };
    }
  }

  return {
    id: getFieldId(item),
    type,
    label: item.title,
    required: item.requiredStatus,
    options,
    config:
      type === 'COMPANION'
        ? { maxSelection: maxSelection ?? COMPANION_MAX_COUNT }
        : maxSelection
          ? { maxSelection }
          : undefined,
    logic,
  };
}

export function adaptDynamicFormToSchema(
  dynamicForm: DynamicFormItem[],
  formTitle: string = 'form-title',
  formDescription?: string,
): FormSchema {
  const formId = crypto.randomUUID();

  return {
    id: formId,
    title: formTitle,
    description: formDescription,
    items: dynamicForm.map((item) => adaptDynamicFormItem(item, dynamicForm)),
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
