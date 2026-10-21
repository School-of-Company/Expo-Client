'use client';

import React from 'react';
import {
  Control,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import {
  TextField,
  TextAreaField,
  PhoneField,
  MultiSelectField,
  DropdownField,
  CompanionField,
  COMPANION_MAX_COUNT,
} from '@/entities/form';
import { FormItem } from '@/features/form/common/model/formSchema';
import { FormValues } from '../lib/visibilityEngine';

interface FieldRendererProps {
  item: FormItem;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  /** 회차 잔여석 등 폼 정의 밖에서 오는 동행자 상한. 폼 정의 상한과 함께 더 작은 쪽을 쓴다. */
  companionMaxCount?: number;
  /** 연쇄 조건까지 따진 표시 여부(`getVisibleFieldIds`). 숨기면 그리지 않아 검증에서도 빠진다 */
  visible: boolean;
  /** 지금 고를 수 있는 직업만 남긴다. `fieldId` 는 직업 문항, 동행자 구분에도 같이 쓴다 */
  occupationLock?: OccupationLock;
  /** 휴대폰 인증한 번호. `fieldId` 전화번호 문항에 채우고 고칠 수 없게 한다 */
  lockedPhone?: LockedPhone;
}

export interface LockedPhone {
  fieldId: string;
  value: string;
}

export interface OccupationLock {
  fieldId?: string;
  allowed: string[];
  notice: string;
}

export default function FieldRenderer({
  item,
  register,
  control,
  watch,
  setValue,
  companionMaxCount,
  occupationLock,
  lockedPhone,
  visible,
}: FieldRendererProps) {
  if (!visible) {
    return null;
  }

  // 서버 폼의 전화번호 문항은 TEXT 로 그려진다. 인증한 번호로 잠글 때는 전화번호 칸으로 보여 준다
  const type = lockedPhone?.fieldId === item.id ? 'PHONE' : item.type;

  switch (type) {
    case 'TEXT':
      return (
        <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
          <div className="flex items-center gap-2">
            <p className="text-h3b text-black">{item.label}</p>
            {item.required && <p className="text-main-600">*</p>}
          </div>
          <div className="space-y-10">
            <TextField
              name={item.id}
              label={item.label}
              required={item.required}
              placeholder={item.config?.placeholder}
              register={register}
            />
          </div>
        </div>
      );

    case 'TEXTAREA':
      return (
        <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
          <div className="flex items-center gap-2">
            <p className="text-h3b text-black">{item.label}</p>
            {item.required && <p className="text-main-600">*</p>}
          </div>
          <div className="space-y-10">
            <TextAreaField
              name={item.id}
              label={item.label}
              required={item.required}
              placeholder={item.config?.placeholder}
              register={register}
            />
          </div>
        </div>
      );

    case 'PHONE':
      return (
        <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
          <div className="flex items-center gap-2">
            <p className="text-h3b text-black">{item.label}</p>
            {item.required && <p className="text-main-600">*</p>}
          </div>
          <div className="space-y-10">
            <PhoneField
              name={item.id}
              label={item.label}
              required={item.required}
              register={register}
              setValue={setValue}
              watch={watch}
              lockedValue={
                lockedPhone?.fieldId === item.id ? lockedPhone.value : undefined
              }
            />
          </div>
        </div>
      );

    case 'CHECKBOX':
      return (
        <label className="flex cursor-pointer items-center gap-12 rounded-sm border-1 border-solid border-gray-200 p-18">
          <input
            type="checkbox"
            className="h-16 w-16 accent-blue-500"
            {...register(item.id, {
              required: item.required ? `${item.label}에 체크해주세요` : false,
            })}
          />
          <p className="text-h3b text-black">{item.label}</p>
          {item.required && <p className="text-main-600">*</p>}
        </label>
      );

    case 'MULTI_SELECT':
      return (
        <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
          <div className="flex items-center gap-2">
            <p className="text-h3b text-black">{item.label}</p>
            {item.required && <p className="text-main-600">*</p>}
          </div>
          <div className="space-y-10">
            <MultiSelectField
              name={item.id}
              label={item.label}
              options={item.options || []}
              required={item.required}
              maxSelection={item.config?.maxSelection}
              control={control}
            />
          </div>
        </div>
      );

    case 'DROPDOWN':
      return (
        <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
          <div className="flex items-center gap-2">
            <p className="text-h3b text-black">{item.label}</p>
            {item.required && <p className="text-main-600">*</p>}
          </div>
          <div className="space-y-10">
            <DropdownField
              name={item.id}
              options={item.options || []}
              required={item.required}
              placeholder={item.config?.placeholder}
              register={register}
              setValue={setValue}
              {...(occupationLock?.fieldId === item.id && {
                disabledValues: (item.options ?? [])
                  .filter(
                    (option) => !occupationLock.allowed.includes(option.value),
                  )
                  .map((option) => option.id),
                disabledNotice: occupationLock.notice,
              })}
            />
          </div>
        </div>
      );

    case 'COMPANION':
      return (
        <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
          <div className="flex items-center gap-2">
            <p className="text-h3b text-black">{item.label}</p>
            {item.required && <p className="text-main-600">*</p>}
          </div>
          <CompanionField
            name={item.id}
            label={item.label}
            required={item.required}
            maxCount={
              companionMaxCount === undefined
                ? item.config?.maxSelection
                : Math.min(
                    item.config?.maxSelection ?? COMPANION_MAX_COUNT,
                    companionMaxCount,
                  )
            }
            allowedOccupations={occupationLock?.allowed}
            occupationNotice={occupationLock?.notice}
            control={control}
            register={register}
          />
        </div>
      );

    default:
      return null;
  }
}
