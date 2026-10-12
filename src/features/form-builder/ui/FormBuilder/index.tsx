'use client';

import {
  Announcements,
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { BUILDER_FORM_TYPES, formTypeRegistry } from '@/entities/form';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { FormRenderer } from '@/features/form/renderer/ui';
import {
  addField,
  changeFormType,
  duplicateField,
  moveField,
  nextOptionKey,
  removeField,
  removeOption,
  updateField,
} from '../../model/fieldOps';
import { validateFields } from '../../model/validateFields';
import FieldCard from '../FieldCard';
import type { DynamicFormItem } from '@/shared/types/application/type';

/** 저장할 API. 신청 폼(/forms), 설문(/surveys), 프로그램용 폼(/forms/expos/{id}/program-forms). */
export type FormBuilderVariant = 'application' | 'survey' | 'program';

interface Props {
  /** 기본값 'application'. 특수 필드·기타 입력 노출이 달라진다. */
  variant?: FormBuilderVariant;
  value: DynamicFormItem[];
  onChange: (value: DynamicFormItem[]) => void;
}

const FormBuilder = ({ variant = 'application', value, onChange }: Props) => {
  const sensors = useSensors(
    // 입력창 클릭과 구분하려고 핸들을 조금 움직여야 드래그가 시작된다.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [drag, setDrag] = useState<{ from: number; to: number } | null>(null);

  const warnings = useMemo(() => validateFields(value), [value]);
  const preview = useMemo(() => adaptDynamicFormToSchema(value, ''), [value]);

  // 드래그 중: 지금 놓으면 새로 경고가 생길 문항을 미리 표시한다.
  const willBreak = useMemo(() => {
    if (!drag || drag.from === drag.to) return new Set<number>();
    const moved = moveField(value, drag.from, drag.to);
    const next = validateFields(moved);
    const before = new Set(
      Array.from(warnings).flatMap(([i, w]) =>
        w.map((m) => `${value[i].id}:${m}`),
      ),
    );
    return new Set(
      Array.from(next)
        .filter(([i, w]) => w.some((m) => !before.has(`${moved[i].id}:${m}`)))
        .map(([i]) => moved[i].id),
    );
  }, [drag, value, warnings]);

  const indexOf = (id: UniqueIdentifier) =>
    value.findIndex((item) => item.id === id);
  const label = (id: UniqueIdentifier) => {
    const i = indexOf(id);
    return `${i + 1}번 문항 "${value[i]?.title || '제목 없음'}"`;
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => `${label(active.id)}을 들었습니다.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${label(active.id)}을 ${indexOf(over.id) + 1}번 위치로 옮기는 중입니다.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${label(active.id)}을 ${indexOf(over.id) + 1}번 위치에 놓았습니다.`
        : `${label(active.id)}을 놓았습니다.`,
    onDragCancel: ({ active }) =>
      `순서 변경을 취소했습니다. ${label(active.id)}은 제자리에 있습니다.`,
  };

  const handleDragOver = ({ active, over }: DragOverEvent) =>
    over && setDrag({ from: indexOf(active.id), to: indexOf(over.id) });

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDrag(null);
    if (!over || active.id === over.id) return;
    onChange(moveField(value, indexOf(active.id), indexOf(over.id)));
  };

  return (
    <div className="flex justify-center gap-32 mobile:flex-col">
      <section
        className="min-w-0 max-w-[792px] flex-1 space-y-16"
        aria-label="문항 편집"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          accessibility={{
            announcements,
            screenReaderInstructions: {
              draggable:
                '스페이스 키로 문항을 들고, 위아래 방향키로 옮긴 뒤 스페이스 키로 놓습니다. Esc 키로 취소합니다.',
            },
          }}
          onDragStart={({ active }) =>
            setDrag({ from: indexOf(active.id), to: indexOf(active.id) })
          }
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDrag(null)}
        >
          <SortableContext
            items={value.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="space-y-16">
              {value.map((item, index) => (
                <FieldCard
                  key={item.id}
                  list={value}
                  index={index}
                  warnings={warnings.get(index)}
                  willBreak={willBreak.has(item.id)}
                  variant={variant}
                  onChange={(next) => onChange(updateField(value, index, next))}
                  onChangeType={(type) =>
                    onChange(changeFormType(value, index, type))
                  }
                  onRemove={() => onChange(removeField(value, index))}
                  onDuplicate={() => onChange(duplicateField(value, index))}
                  onAddOption={() =>
                    onChange(
                      updateField(value, index, {
                        ...item,
                        jsonData: {
                          ...item.jsonData,
                          [nextOptionKey(item.jsonData)]: '',
                        },
                      }),
                    )
                  }
                  onRemoveOption={(key) =>
                    onChange(removeOption(value, index, key))
                  }
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>

        <div className="flex flex-wrap gap-8">
          {BUILDER_FORM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange(addField(value, type))}
              className="flex items-center gap-6 rounded-sm border-1 border-solid border-gray-200 bg-white px-12 py-8 text-caption1r text-gray-500 hover:border-main-600 hover:text-main-600"
            >
              {formTypeRegistry[type].icon}+ {formTypeRegistry[type].label}
            </button>
          ))}
        </div>
      </section>

      <aside
        className="sticky top-0 max-h-screen w-[400px] shrink-0 overflow-y-auto rounded-md border-1 border-solid border-gray-200 bg-white p-24 mobile:static mobile:w-full"
        aria-label="미리보기"
      >
        <p className="mb-16 text-caption1b text-gray-500">미리보기</p>
        {/* 문항 구성이 바뀌면 이전 답변이 엉키지 않게 새로 마운트한다. */}
        <FormRenderer
          key={value.map((item) => item.id).join()}
          schema={preview}
          onSubmit={() => {}}
          renderFooter={() => null}
        />
      </aside>
    </div>
  );
};

export default FormBuilder;
