'use client';

import React from 'react';
import { ImageInput } from '@/entities/create-exhibition';
import AddressSearch from '@/entities/create-exhibition/ui/SearchAddress';
import TrainingModule from '@/entities/create-exhibition/ui/TrainingModule';
import { Button, Input } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';
import { useExhibitionForm } from '../../model/useExhibitionForm';

const ExhibitionForm = () => {
  const {
    title,
    setTitle,
    textAreaContent,
    setTextAreaContent,
    img,
    setImg,
    address,
    setAddress,
    handleConvertAddress,
  } = useExhibitionForm();

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
          <AddressSearch value={address} setValue={setAddress} />
        </div>
        <Button onClick={handleConvertAddress} text="확인" />
      </div>
    </div>
  );
};

export default ExhibitionForm;
