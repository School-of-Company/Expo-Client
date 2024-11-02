import { useState } from 'react';
import { convertAddressToCoordinates } from './api';

export const useExhibitionForm = () => {
  const [title, setTitle] = useState<string>('');
  const [textAreaContent, setTextAreaContent] = useState('');
  const [img, setImg] = useState<string | null>(null);
  const [address, setAddress] = useState('');

  const handleConvertAddress = async () => {
    if (!adress) {
      console.log('주소를 입력해주세요.');
      return;
  }
  
  const coordinates = await convertAddressToCoordinates(adress);
  console.log(coordinates ? `좌표: ${coordinates}` : 좌표 변환에 실패했습니다.);

  return {
    title,
    setTitle,
    textAreaContent,
    setTextAreaContent,
    img,
    setImg,
    address,
    setAddress,
    handleConvertAddress,
  };
};
