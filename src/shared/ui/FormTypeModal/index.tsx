'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { XMark } from '@/shared/assets/icons';
import Button from '../Button';

const CATEGORIES = {
  EXHIBITION: '박람회',
  FORM: '폼',
  SURVEY: '만족도 조사',
};

const FORM_TYPES = {
  APPLICATION: 'application',
  SURVEY: 'survey',
};

const USER_TYPES = {
  STANDARD: 'STANDARD',
  TRAINEE: 'TRAINEE',
};

interface Props {
  text: string;
  onClose: () => void;
  params: string;
  modalType: string | null;
}

const FormTypeModal = ({ text, onClose, params, modalType }: Props) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);

  const handleCategorySelect = (category: string) => {
    if (category === CATEGORIES.EXHIBITION) {
      router.push(`/exhibition/edit/${params}`);
      return;
    }

    setSelectedCategory(category);

    if (category === CATEGORIES.FORM) {
      setSelectedFormType(FORM_TYPES.APPLICATION);
    } else if (category === CATEGORIES.SURVEY) {
      setSelectedFormType(FORM_TYPES.SURVEY);
    }
  };

  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type);

    if (
      type === USER_TYPES.TRAINEE ||
      selectedCategory === CATEGORIES.SURVEY ||
      modalType === 'message'
    ) {
      handleFinalSelection(type, 'register');
    }
  };

  const handleRegistrationTypeSelect = (type: 'register' | 'onsite') => {
    if (selectedUserType) {
      handleFinalSelection(selectedUserType, type);
    }
  };

  const handleFinalSelection = (
    userType: string,
    appType: 'register' | 'onsite',
  ) => {
    const baseURL = window.location.origin;

    if (modalType === 'message') {
      router.push(`/sms/${params}/${userType}`);
    } else if (modalType === 'edit' && selectedFormType) {
      router.push(
        `/form/edit/${params}?type=${userType}&mode=${selectedFormType}&applicationType=${appType}`,
      );
    } else if (modalType === 'formcreate' && selectedFormType) {
      router.push(
        `/form/create/${params}?type=${userType}&mode=${selectedFormType}&applicationType=${appType}`,
      );
    } else if (modalType === 'share' && selectedFormType) {
      const url = `${baseURL}/application/${params}?formType=${selectedFormType}&userType=${userType}&applicationType=${appType}`;
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success('URL이 클립보드에 복사되었습니다.');
        })
        .catch(() => {
          toast.error('URL 복사에 실패했습니다. 다시 시도해주세요.');
        });
    } else if (modalType === 'onsite') {
      router.push(
        `/exhibition/access-qr/${params}?userType=${userType}&applicationType=${appType}`,
      );
    }

    onClose();
  };

  const renderButtons = () => {
    if (
      (modalType === 'message' || modalType === 'onsite') &&
      !selectedUserType
    ) {
      return [
        {
          label: '참가자',
          onClick: () => handleUserTypeSelect(USER_TYPES.STANDARD),
        },
        {
          label: '연수자',
          onClick: () => handleUserTypeSelect(USER_TYPES.TRAINEE),
        },
      ];
    }

    if (modalType === 'onsite' && selectedUserType === USER_TYPES.STANDARD) {
      return [
        {
          label: '사전 등록',
          onClick: () => handleRegistrationTypeSelect('register'),
        },
        {
          label: '현장 등록',
          onClick: () => handleRegistrationTypeSelect('onsite'),
        },
      ];
    }

    if (
      (modalType === 'edit' ||
        modalType === 'formcreate' ||
        modalType === 'share') &&
      !selectedCategory
    ) {
      const categories =
        modalType === 'edit'
          ? [CATEGORIES.EXHIBITION, CATEGORIES.FORM, CATEGORIES.SURVEY]
          : [CATEGORIES.FORM, CATEGORIES.SURVEY];

      return categories.map((category) => ({
        label: category,
        onClick: () => handleCategorySelect(category),
      }));
    }

    if (
      (modalType === 'edit' ||
        modalType === 'formcreate' ||
        modalType === 'share') &&
      selectedCategory &&
      !selectedUserType
    ) {
      return [
        {
          label: '참가자',
          onClick: () => handleUserTypeSelect(USER_TYPES.STANDARD),
        },
        {
          label: '연수자',
          onClick: () => handleUserTypeSelect(USER_TYPES.TRAINEE),
        },
      ];
    }

    if (
      (modalType === 'edit' ||
        modalType === 'formcreate' ||
        modalType === 'share') &&
      selectedCategory === CATEGORIES.FORM &&
      selectedUserType === USER_TYPES.STANDARD
    ) {
      return [
        {
          label: '사전 등록',
          onClick: () => handleRegistrationTypeSelect('register'),
        },
        {
          label: '현장 등록',
          onClick: () => handleRegistrationTypeSelect('onsite'),
        },
      ];
    }

    return [];
  };

  return (
    <div className="w-[656px] rounded-sm bg-white p-28">
      <div className="flex flex-col gap-[90px]">
        <div className="flex w-full justify-between">
          <p className="text-h2b mobile:text-body1b">{text}</p>
          <label className="hover:cursor-pointer" onClick={onClose}>
            <XMark />
          </label>
        </div>
        <div className="flex gap-12">
          {renderButtons().map((button, index) => (
            <Button key={index} variant="white" onClick={button.onClick}>
              {button.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormTypeModal;
