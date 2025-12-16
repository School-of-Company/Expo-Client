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
  SingleSelectField,
  MultiSelectField,
  DropdownField,
} from '@/entities/form';
import { FormItem } from '@/features/form/common/model/formSchema';
import { evaluateVisibility, FormValues } from '../lib/visibilityEngine';

interface FieldRendererProps {
  item: FormItem;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export default function FieldRenderer({
  item,
  register,
  control,
  watch,
  setValue,
}: FieldRendererProps) {
  const formValues = watch();

  const isVisible = evaluateVisibility(item.logic, formValues);

  if (!isVisible) {
    return null;
  }

  switch (item.type) {
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
            />
          </div>
        </div>
      );

    case 'SINGLE_SELECT':
      return (
        <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
          <div className="flex items-center gap-2">
            <p className="text-h3b text-black">{item.label}</p>
            {item.required && <p className="text-main-600">*</p>}
          </div>
          <div className="space-y-10">
            <SingleSelectField
              name={item.id}
              label={item.label}
              options={item.options || []}
              required={item.required}
              allowEtc={item.config?.allowEtc}
              etcLabel={item.config?.etcLabel}
              register={register}
              watch={watch}
              setValue={setValue}
            />
          </div>
        </div>
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
              allowEtc={item.config?.allowEtc}
              etcLabel={item.config?.etcLabel}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
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
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
