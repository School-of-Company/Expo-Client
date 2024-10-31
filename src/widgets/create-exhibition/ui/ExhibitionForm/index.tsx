'use client';

import React, { useState } from 'react';
import { ImageInput } from '@/entities/create-exhibition';
import TrainingModule from '@/entities/create-exhibition/ui/TrainingModule';
import { Button, Input } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';

const ExhibitionForm = () => {
  const [title, setTitle] = useState<string>('');
  const [textAreaContent, setTextAreaContent] = useState('');
  const [img, setImg] = useState<string | null>(null);
  const [place, setPlace] = useState<string>('');

  return (
    <div className="w-full">
      <div className="space-y-[30px]">
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">사진 등록</p>
          <ImageInput img={img} setImg={setImg} />
        </div>
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">제목</p>
          <Input
            value={title}
            setValue={setTitle}
            type="text"
            placeholder="제목을 입력해주세요."
          />
        </div>
        <TextArea
          title="소개글"
          placeholder="소개글을 작성해주세요."
          maxLength={1000}
          text={textAreaContent}
          state={textAreaContent}
          setState={setTextAreaContent}
          row={1}
        />
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">연수 종류</p>
          <TrainingModule />
        </div>
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">장소</p>
          <Input
            value={place}
            setValue={setPlace}
            type="text"
            placeholder="장소를 알려주세요."
          />
        </div>
        <Button text="확인" />
      </div>
    </div>
  );
};

export default ExhibitionForm;
