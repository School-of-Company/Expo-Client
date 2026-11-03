import { useState } from 'react';
import { FieldArrayProps } from '@/shared/types/exhibition/type';
import ExpoInput from '../ExpoInput';

// 이보다 많으면 접은 채로 연다. 프로그램이 쌓여도 아래 입력까지 스크롤이 길어지지 않게 한다
const COLLAPSE_FROM = 5;

interface Props extends FieldArrayProps {
  title: string;
}

/** 검증에 걸린 섹션을 펼칠 때 쓴다. 접혀 있어도 ExpoInput 의 hidden input 은 그대로 남아 폼 검증이 걸린다 */
export const getProgramSectionId = (fieldName: FieldArrayProps['fieldName']) =>
  `program-section-${fieldName}`;

const TrainingModule = ({
  title,
  fields,
  append,
  remove,
  register,
  setValue,
  watch,
  fieldName,
}: Props) => {
  // 펼침 여부는 details 가 직접 들고 있는다. 프로그램을 추가해 개수가 바뀌어도 다시 접히지 않도록 처음 한 번만 정한다
  const [openByDefault] = useState(() => fields.length <= COLLAPSE_FROM);

  return (
    <details
      id={getProgramSectionId(fieldName)}
      open={openByDefault}
      className="w-full rounded-sm border-1 border-solid border-gray-200 px-[30px] py-[16px]"
    >
      <summary className="cursor-pointer select-none text-h3b text-black">
        {title}
        <span className="text-body4 ml-8 text-gray-500">{fields.length}</span>
      </summary>
      <div className="w-full pt-16">
        <ExpoInput
          fields={fields}
          append={append}
          remove={remove}
          register={register}
          setValue={setValue}
          watch={watch}
          fieldName={fieldName}
        />
      </div>
    </details>
  );
};

export default TrainingModule;
