import {
  FormSchema,
  FormItem,
  Option,
  FormLogic,
} from '@/features/form/common/model/formSchema';
import { DynamicFormItem } from '@/shared/types/application/type';

interface ParsedJsonData {
  id: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
}

interface ConditionalLogic {
  parentId: string;
  triggerValue: string;
}

interface ParsedOtherJson {
  hasEtc?: boolean;
  maxSelection?: number;
  minSelection?: number;
  conditional?: ConditionalLogic;
}

function parseJsonData(jsonDataStr?: string): ParsedJsonData | null {
  if (!jsonDataStr) return null;

  try {
    const parsed = JSON.parse(jsonDataStr);

    if (!parsed.id) {
      throw new Error('jsonData must contain an id field');
    }

    return {
      id: parsed.id,
      options: parsed.options || undefined,
    };
  } catch (error) {
    console.error('Failed to parse jsonData:', error);
    return null;
  }
}

function parseOtherJson(otherJsonStr: string | null): ParsedOtherJson {
  if (!otherJsonStr) return {};

  try {
    const parsed = JSON.parse(otherJsonStr);
    return {
      hasEtc: parsed.hasEtc,
      maxSelection: parsed.maxSelection,
      minSelection: parsed.minSelection,
      conditional: parsed.conditional,
    };
  } catch (error) {
    console.error('Failed to parse otherJson:', error);
    return {};
  }
}

function mapFormType(formType: DynamicFormItem['formType']): FormItem['type'] {
  switch (formType) {
    case 'SENTENCE':
      return 'TEXT';
    case 'CHECKBOX':
      return 'MULTI_SELECT';
    case 'MULTIPLE':
      return 'SINGLE_SELECT';
    case 'DROPDOWN':
      return 'DROPDOWN';
    case 'APPLICATIONPHONEOPTION':
      return 'PHONE';
    default:
      return 'TEXT';
  }
}

function adaptDynamicFormItem(
  item: DynamicFormItem,
  allItems: DynamicFormItem[],
): FormItem {
  const fieldType = mapFormType(item.formType);
  const parsedJsonData = parseJsonData(item.jsonData);
  const parsedConfig = parseOtherJson(item.otherJson);
  const { conditional, hasEtc, maxSelection, minSelection } = parsedConfig;

  if (!parsedJsonData?.id) {
    throw new Error(`jsonData must contain an id field. Item: ${item.title}`);
  }

  let options: Option[] | undefined;
  if (
    (fieldType === 'MULTI_SELECT' ||
      fieldType === 'SINGLE_SELECT' ||
      fieldType === 'DROPDOWN') &&
    parsedJsonData?.options
  ) {
    options = parsedJsonData.options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      value: opt.value,
    }));
  }

  let logic: FormLogic | undefined;
  if (conditional?.parentId) {
    const parentItem = allItems.find((i) => {
      try {
        const parsed = JSON.parse(i.jsonData || '{}');
        return parsed.id === conditional.parentId;
      } catch {
        return false;
      }
    });

    const isParentMultiSelect = parentItem?.formType === 'CHECKBOX';

    logic = {
      visibility: {
        op: 'AND',
        conditions: [
          {
            fieldId: conditional.parentId,
            op: isParentMultiSelect ? 'contains' : 'eq',
            value: conditional.triggerValue,
          },
        ],
      },
    };
  }

  const config =
    hasEtc !== undefined ||
    maxSelection !== undefined ||
    minSelection !== undefined
      ? {
          allowEtc: hasEtc,
          maxSelection,
          minSelection,
        }
      : undefined;

  return {
    id: parsedJsonData.id,
    type: fieldType,
    label: item.title,
    required: item.requiredStatus,
    options,
    config,
    logic,
  };
}

export function adaptDynamicFormToSchema(
  dynamicForm: DynamicFormItem[],
  formTitle: string = 'form-title',
  formDescription?: string,
): FormSchema {
  const formId = `form-${Date.now()}`;

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
