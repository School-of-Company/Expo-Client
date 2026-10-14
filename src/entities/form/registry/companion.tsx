'use client';

import { ArrowDown } from '@/shared/assets/icons';
import {
  COMPANION_MAX_COUNT,
  OCCUPATION_OPTIONS,
  SCHOOL_OCCUPATIONS,
} from '../constants/occupationData';
import { isRegion, RegionSelect } from './region';
import type { FieldDefinition, FieldRendererProps } from './model';
import type {
  Companion,
  DynamicFormItem,
} from '@/shared/types/application/type';

const EMPTY_COMPANION: Companion = {
  name: '',
  occupation: '',
  region: '',
  school: '',
};

const needsSchool = (occupation: string) =>
  SCHOOL_OCCUPATIONS.some((key) => key === occupation);

const toList = (value: unknown) =>
  Array.isArray(value) ? (value as Companion[]) : [];

/**
 * 서버 폼 정의에는 최소 인원이 없어 필수면 1명, 아니면 0명.
 * 최대는 `otherJson.maxSelection`이고 어느 쪽이든 `COMPANION_MAX_COUNT`를 넘지 않는다(Form `answer-spec.schema.ts`).
 */
export const companionCountRange = (item: DynamicFormItem) => ({
  min: item.requiredStatus ? 1 : 0,
  max: Math.min(
    item.otherJson?.maxSelection ?? COMPANION_MAX_COUNT,
    COMPANION_MAX_COUNT,
  ),
});

/** 동행자 한 명 검사. Form `companionSchema`와 같은 기준이다. */
const checkCompanion = ({ name, occupation, region, school }: Companion) => {
  const trimmed = name.trim();
  if (!trimmed) return '이름을 입력해주세요';
  if (trimmed.length > 10) return '이름은 10자 이하입니다';
  if (!occupation) return '구분을 선택해주세요';
  if (!isRegion(region)) return '지역을 선택해주세요';
  if (needsSchool(occupation)) {
    const schoolName = school?.trim() ?? '';
    if (!schoolName) return '소속을 입력해주세요';
    if (schoolName.length > 100) return '소속은 100자 이하입니다';
  }
};

const inputClassName =
  'w-full rounded-sm border-1 border-solid border-gray-100 bg-white px-16 py-12 text-body2r text-black';

/** 동행자 목록. 대표자가 한 명씩 추가하고 사람마다 이름·구분·지역(교사·예비교사는 소속까지)을 받는다. */
function CompanionRenderer({ item, value, onChange }: FieldRendererProps) {
  const list = toList(value);
  const { max } = companionCountRange(item);
  const update = (index: number, patch: Partial<Companion>) =>
    onChange(list.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  return (
    <div className="flex flex-col gap-16">
      <p className="text-caption1r text-gray-500">
        대표자를 포함해 최대 {max + 1}명까지 함께 신청할 수 있습니다. 동행자는
        대표자 번호로 등록되고 사람마다 QR을 받습니다.
      </p>

      {list.map((companion, index) => (
        <div
          key={index}
          className="flex flex-col gap-12 rounded-sm bg-gray-100 p-16"
        >
          <div className="flex items-center justify-between">
            <p className="text-body2b text-black">동행자 {index + 1}</p>
            <button
              type="button"
              onClick={() => onChange(list.filter((_, i) => i !== index))}
              className="text-caption1r text-gray-500"
            >
              삭제
            </button>
          </div>
          <input
            className={inputClassName}
            aria-label={`동행자 ${index + 1} 이름`}
            placeholder="이름"
            maxLength={10}
            value={companion.name}
            onChange={(e) => update(index, { name: e.target.value })}
          />
          <div className="relative w-fit">
            <select
              className="w-fit appearance-none rounded-sm border-1 border-solid border-gray-100 bg-white py-12 pl-16 pr-48 text-body2r text-black"
              aria-label={`동행자 ${index + 1} 구분`}
              value={companion.occupation}
              onChange={(e) => update(index, { occupation: e.target.value })}
            >
              <option value="" disabled>
                구분 선택
              </option>
              {OCCUPATION_OPTIONS.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 [&_svg]:h-16 [&_svg]:w-16">
              <ArrowDown />
            </span>
          </div>
          <RegionSelect
            label={`동행자 ${index + 1} 지역`}
            value={companion.region}
            onChange={(region) => update(index, { region })}
          />
          {needsSchool(companion.occupation) && (
            <input
              className={inputClassName}
              aria-label={`동행자 ${index + 1} 소속`}
              placeholder="소속 (예: 광주초)"
              maxLength={100}
              value={companion.school ?? ''}
              onChange={(e) => update(index, { school: e.target.value })}
            />
          )}
        </div>
      ))}

      <button
        type="button"
        disabled={list.length >= max}
        onClick={() => onChange([...list, { ...EMPTY_COMPANION }])}
        className="rounded-sm border-1 border-dashed border-gray-300 px-16 py-12 text-body2b text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        {list.length >= max
          ? `동행자는 최대 ${max}명입니다`
          : `+ 동행자 추가 (${list.length}/${max})`}
      </button>
    </div>
  );
}

export const companionField: FieldDefinition = {
  Renderer: CompanionRenderer,
  defaultValue: () => [],
  validate: (item, value) => {
    const list = toList(value);
    const { min, max } = companionCountRange(item);
    if (list.length < min) return `동행자를 ${min}명 이상 추가해주세요`;
    if (list.length > max) return `동행자는 최대 ${max}명입니다`;
    for (let index = 0; index < list.length; index += 1) {
      const message = checkCompanion(list[index]);
      if (message) return `동행자 ${index + 1}: ${message}`;
    }
  },
  // 공백을 걷고, 소속이 필요 없는 구분이면 소속을 뺀다(Form이 거부한다). 0명이면 답을 뺀다.
  toAnswer: (_item, value) => {
    const list = toList(value);
    if (list.length === 0) return undefined;
    return list.map(({ name, occupation, region, school }) => ({
      name: name.trim(),
      occupation,
      region,
      ...(needsSchool(occupation) && { school: school?.trim() }),
    }));
  },
};
