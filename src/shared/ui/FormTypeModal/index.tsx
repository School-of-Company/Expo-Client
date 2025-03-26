'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { XMark } from '@/shared/assets/icons';
import Button from '../Button';

interface Props {
  text: string;
  onClose: () => void;
  params: number;
  modalType: string | null;
}

const FormTypeModal = ({ text, onClose, params, modalType }: Props) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<string | null>(null);

  const handleCategorySelect = (category: string) => {
    if (category === '박람회') {
      router.push(`/exhibition/edit/${params}`);
      return;
    }

    setSelectedCategory(category);

    if (category === '폼') {
      setSelectedFormType('application');
    } else if (category === '만족도 조사') {
      setSelectedFormType('survey');
    }
  };

  const handleFinalSelection = (type: string) => {
    const baseURL = window.location.origin;

    if (modalType === 'message') {
      router.push(`/sms/${params}/${type}`);
    } else if (modalType === 'edit' && selectedFormType) {
      router.push(`/form/edit/${params}?type=${type}&mode=${selectedFormType}`);
    } else if (modalType === 'share' && selectedFormType) {
      const url = `${baseURL}/application/${params}?formType=${selectedFormType}&userType=${type}&applicationType=register`;
      navigator.clipboard.writeText(url).then(() => {
        toast.success('URL이 클립보드에 복사되었습니다.');
      });
    }

    onClose();
  };

  return (
    <div className="w-[656px] rounded-sm bg-white p-28">
      <div className="flex flex-col gap-[90px]">
        <div className="flex w-full justify-between">
          <p className="text-h2b">{text}</p>
          <label className="hover:cursor-pointer" onClick={onClose}>
            <XMark />
          </label>
        </div>
        <div className="flex gap-12">
          {modalType === 'message' && (
            <>
              <Button
                variant="white"
                onClick={() => handleFinalSelection('STANDARD')}
              >
                참가자
              </Button>
              <Button
                variant="white"
                onClick={() => handleFinalSelection('TRAINEE')}
              >
                연수자
              </Button>
            </>
          )}

          {modalType === 'edit' && selectedCategory === null && (
            <>
              <Button
                variant="white"
                onClick={() => handleCategorySelect('박람회')}
              >
                박람회
              </Button>
              <Button
                variant="white"
                onClick={() => handleCategorySelect('폼')}
              >
                폼
              </Button>
              <Button
                variant="white"
                onClick={() => handleCategorySelect('만족도 조사')}
              >
                만족도 조사
              </Button>
            </>
          )}

          {modalType === 'edit' && selectedCategory && (
            <>
              {selectedCategory !== '박람회' && (
                <>
                  <Button
                    variant="white"
                    onClick={() => handleFinalSelection('STANDARD')}
                  >
                    참가자
                  </Button>
                  <Button
                    variant="white"
                    onClick={() => handleFinalSelection('TRAINEE')}
                  >
                    연수자
                  </Button>
                </>
              )}
            </>
          )}

          {modalType === 'share' && selectedCategory === null && (
            <>
              <Button
                variant="white"
                onClick={() => handleCategorySelect('폼')}
              >
                폼
              </Button>
              <Button
                variant="white"
                onClick={() => handleCategorySelect('만족도 조사')}
              >
                만족도 조사
              </Button>
            </>
          )}

          {modalType === 'share' && selectedCategory && (
            <>
              <Button
                variant="white"
                onClick={() => handleFinalSelection('STANDARD')}
              >
                참가자
              </Button>
              <Button
                variant="white"
                onClick={() => handleFinalSelection('TRAINEE')}
              >
                연수자
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormTypeModal;
