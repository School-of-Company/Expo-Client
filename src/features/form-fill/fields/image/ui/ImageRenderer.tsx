'use client';

import React, { useEffect, useState } from 'react';
import { useController } from 'react-hook-form';
import {
  IMAGE_EXTENSIONS,
  IMAGE_MAX_BYTES,
  IMAGE_UPLOADING,
  checkImageFile,
  imageModel,
  type FieldRendererProps,
} from '@/entities/form';
import { uploadFormImage } from '../api/uploadFormImage';

const ACCEPT = IMAGE_EXTENSIONS.map((extension) => `.${extension}`).join(',');

/** 이미지 한 장 업로드. 고르면 바로 올리고, 올리는 동안은 제출을 막는다. 실패하면 다시 시도할 수 있다. */
export default function ImageRenderer({
  item,
  name,
  control,
}: FieldRendererProps) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: { validate: (value) => imageModel.validate(value, item) },
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const upload = async (target: File) => {
    setError(null);
    field.onChange(IMAGE_UPLOADING);
    try {
      field.onChange(await uploadFormImage(target));
    } catch {
      field.onChange('');
      setError('업로드에 실패했습니다. 다시 시도해주세요');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = ''; // 같은 파일을 다시 골라도 onChange가 오게 비운다.
    if (!selected) return;
    const checked = checkImageFile(selected);
    if (checked !== true) {
      setError(checked);
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    upload(selected);
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    field.onChange('');
  };

  const uploading = field.value === IMAGE_UPLOADING;
  const message = error ?? fieldState.error?.message;

  return (
    <div className="flex flex-col gap-8">
      {preview ? (
        <div className="relative overflow-hidden rounded-sm border-1 border-solid border-gray-200">
          <img
            src={preview}
            alt={`${item.title} 미리보기`}
            className={`max-h-[240px] w-full object-contain ${uploading ? 'opacity-50' : ''}`}
          />
          {uploading && (
            <p className="absolute inset-0 flex items-center justify-center text-body2b text-gray-700">
              업로드 중...
            </p>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center rounded-sm border-1 border-dashed border-gray-300 px-16 py-32 text-body2b text-gray-500">
          사진 선택 ({IMAGE_EXTENSIONS.join(', ')},{' '}
          {IMAGE_MAX_BYTES / 1024 / 1024}
          MB 이하)
          <input
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={handleChange}
            onBlur={field.onBlur}
          />
        </label>
      )}

      {preview && !uploading && (
        <div className="flex gap-8">
          {error && file && (
            <button
              type="button"
              onClick={() => upload(file)}
              className="text-caption1r text-main-600"
            >
              다시 시도
            </button>
          )}
          <button
            type="button"
            onClick={clear}
            className="text-caption1r text-gray-500"
          >
            삭제
          </button>
        </div>
      )}

      {message && <span className="text-caption1r text-error">{message}</span>}
    </div>
  );
}
