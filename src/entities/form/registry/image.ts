import type { FieldModel } from './types';

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

/** 업로드 전에 고른 파일을 검사한다. 통과하면 `true`, 아니면 에러 문구. */
export const checkImageFile = (file: Pick<File, 'name' | 'size'>) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!(IMAGE_EXTENSIONS as readonly string[]).includes(extension))
    return `${IMAGE_EXTENSIONS.join(', ')} 파일만 올릴 수 있습니다`;
  if (file.size > IMAGE_MAX_BYTES)
    return `${IMAGE_MAX_BYTES / 1024 / 1024}MB 이하 파일만 올릴 수 있습니다`;
  return true;
};

/** 업로드 중에는 이 값이 폼에 들어가 제출을 막는다. 끝나면 업로드된 URL로 바뀐다. */
export const IMAGE_UPLOADING = '__uploading__';

/** 폼 값은 업로드된 이미지 URL. */
export const imageModel: FieldModel<string> = {
  validate: (value, item) => {
    if (value === IMAGE_UPLOADING) return '이미지를 업로드하는 중입니다';
    if (!value && item.requiredStatus) return '이미지를 올려주세요';
    return true;
  },
  // 비었으면 `undefined` — Form은 이미지 값을 `z.string().min(1)`로 받아 빈 문자열을 거부한다.
  serialize: (value) =>
    value && value !== IMAGE_UPLOADING ? value : undefined,
};
