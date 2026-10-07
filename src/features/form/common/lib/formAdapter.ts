import {
  FormSchema,
  FormItem,
  FormLogic,
} from '@/features/form/common/model/formSchema';
import { DynamicFormItem, JsonData } from '@/shared/types/application/type';

/** 렌더러 필드 id. 서버 문항 id이고, 설문 답변(`answers`)의 키로도 쓴다. */
export const getFieldId = (item: DynamicFormItem) => String(item.id);

export const optionLabel = (option: JsonData[string]) =>
  typeof option === 'string' ? option : option.value;

function mapFormType(formType: DynamicFormItem['formType']): FormItem['type'] {
  switch (formType) {
    case 'CHECKBOX':
      return 'CHECKBOX';
    case 'MULTIPLE':
      return 'MULTI_SELECT';
    case 'DROPDOWN':
      return 'DROPDOWN';
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
  const options =
    type === 'MULTI_SELECT' || type === 'DROPDOWN'
      ? Object.entries(item.jsonData).map(([key, option]) => ({
          id: key,
          label: optionLabel(option),
          value: key,
        }))
      : undefined;

  let logic: FormLogic | undefined;
  const parent = conditional && allItems[conditional.parentIndex];
  if (parent) {
    const fieldId = getFieldId(parent);
    logic = {
      visibility: {
        op: 'AND',
        conditions: [
          conditional.triggerValues
            ? { fieldId, op: 'in', value: conditional.triggerValues }
            : {
                fieldId,
                op: parent.formType === 'MULTIPLE' ? 'contains' : 'eq',
                value: conditional.triggerValue ?? '',
              },
        ],
      },
    };
  }

  return {
    id: getFieldId(item),
    type,
    label: item.title,
    required: item.requiredStatus,
    options,
    config: maxSelection ? { maxSelection } : undefined,
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
