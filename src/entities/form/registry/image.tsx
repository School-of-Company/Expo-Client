'use client';

import { useEffect, useState } from 'react';
import { uploadFormImage } from '../api/uploadFormImage';
import type { FieldDefinition, FieldRendererProps } from './model';

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
/** 업로드 중에는 이 값이 폼에 들어가 제출을 막는다. 끝나면 업로드된 URL로 바뀐다. */
export const IMAGE_UPLOADING = '__uploading__';

/** 업로드 전에 고른 파일을 검사한다. 통과면 undefined, 아니면 오류 문구. */
export const checkImageFile = (file: Pick<File, 'name' | 'size'>) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!(IMAGE_EXTENSIONS as readonly string[]).includes(extension))
    return `${IMAGE_EXTENSIONS.join(', ')} 파일만 올릴 수 있습니다`;
  if (file.size > IMAGE_MAX_BYTES)
    return `${IMAGE_MAX_BYTES / 1024 / 1024}MB 이하 파일만 올릴 수 있습니다`;
};

const ACCEPT = IMAGE_EXTENSIONS.map((extension) => `.${extension}`).join(',');

/** 이미지 한 장. 고르면 바로 올리고, 올리는 동안은 제출을 막는다. 실패하면 다시 시도할 수 있다. */
function ImageRenderer({ item, value, onChange }: FieldRendererProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const upload = async (target: File) => {
    setError(undefined);
    onChange(IMAGE_UPLOADING);
    try {
      onChange(await uploadFormImage(target));
    } catch {
      onChange('');
      setError('업로드에 실패했습니다. 다시 시도해주세요');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = ''; // 같은 파일을 다시 골라도 onChange가 오게 비운다.
    if (!selected) return;
    const message = checkImageFile(selected);
    if (message) {
      setError(message);
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    upload(selected);
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setError(undefined);
    onChange('');
  };

  const uploading = value === IMAGE_UPLOADING;

  return (
    <div className="flex flex-col gap-8">
      {preview ? (
        <div className="relative overflow-hidden rounded-sm border-1 border-solid border-gray-100">
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
          {IMAGE_MAX_BYTES / 1024 / 1024}MB 이하)
          <input
            type="file"
            accept={ACCEPT}
            aria-label={item.title}
            className="hidden"
            onChange={handleChange}
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

      {error && <p className="text-caption1r text-error">{error}</p>}
    </div>
  );
}

export const imageField: FieldDefinition = {
  Renderer: ImageRenderer,
  defaultValue: () => '',
  validate: (item, value) => {
    if (value === IMAGE_UPLOADING) return '이미지를 업로드하는 중입니다';
    if (!value) return item.requiredStatus ? '이미지를 올려주세요' : undefined;
  },
  // Form은 이미지 값을 `z.string().min(1)`로 받아 빈 문자열을 거부한다. 비었으면 답을 뺀다.
  toAnswer: (_item, value) =>
    typeof value === 'string' && value && value !== IMAGE_UPLOADING
      ? value
      : undefined,
};
