'use client';

import axios from 'axios';
import React, { useState } from 'react';
import { ImageInput } from '@/entities/create-exhibition';
import AddressSearch from '@/entities/create-exhibition/ui/SearchAddress';
import TrainingModule from '@/entities/create-exhibition/ui/TrainingModule';
import { Button, Input } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';

const ExhibitionForm = () => {
  const [title, setTitle] = useState<string>('');
  const [textAreaContent, setTextAreaContent] = useState('');
  const [img, setImg] = useState<string | null>(null);
  const [address, setAddress] = useState('');

  const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

  const convertAddressToCoordinates = async (
    address: string,
  ): Promise<{ lat: number; lng: number } | null> => {
    try {
      const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
        address,
      )}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      });

      if (response.status === 200 && response.data.documents.length > 0) {
        const { x, y } = response.data.documents[0].address;
        const coordinates = {
          lat: parseFloat(y),
          lng: parseFloat(x),
        };
        return coordinates;
      } else {
        console.log('주소 결과가 없습니다.');
      }
    } catch (error) {
      console.error('주소 변환 오류:', error);
    }
    return null;
  };

  const handleConvertAddress = async () => {
    if (address) {
      const coordinates = await convertAddressToCoordinates(address);
      if (coordinates) {
        console.log('좌표:', coordinates);
      } else {
        console.log('좌표 변환에 실패했습니다.');
      }
    } else {
      console.log('주소를 입력해주세요.');
    }
  };

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
