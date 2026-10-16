'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import { getRegistrationRoutes } from '@/shared/config';
import { ApplicationType } from '@/shared/types/exhibition/type';
import Button from '../Button';
import SelectDateInput from '../SelectDateInput';

const CATEGORIES = {
  FORM: '등록용 폼',
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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // 'form' 으로 열면 만들기·수정을 먼저 고른다. 'formcreate'·'edit' 로 열면 그 단계를 건너뛴다
  const [action, setAction] = useState<'formcreate' | 'edit' | null>(
    modalType === 'formcreate' || modalType === 'edit' ? modalType : null,
  );
  // 신청 기간은 만들기·수정을 고른 뒤에 받는다
  const hasPeriod = !action || (!!startDate && !!endDate);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);

    if (category === CATEGORIES.FORM) {
      setSelectedFormType(FORM_TYPES.APPLICATION);
    } else if (category === CATEGORIES.SURVEY) {
      setSelectedFormType(FORM_TYPES.SURVEY);
    }
  };

  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type);

    if (type === USER_TYPES.TRAINEE || selectedCategory === CATEGORIES.SURVEY) {
      handleFinalSelection(type, 'PRE');
    }
  };

  const handleRegistrationTypeSelect = (type: ApplicationType) => {
    if (selectedUserType) {
      handleFinalSelection(selectedUserType, type);
    }
  };

  const handleFinalSelection = (userType: string, appType: ApplicationType) => {
    if (action === 'edit' && selectedFormType) {
      router.push(
        `/form/edit/${params}?type=${userType}&mode=${selectedFormType}&applicationType=${appType}&startDate=${startDate?.toISOString() || ''}&endDate=${endDate?.toISOString() || ''}`,
      );
    } else if (action === 'formcreate' && selectedFormType) {
      router.push(
        `/form/create/${params}?type=${userType}&mode=${selectedFormType}&applicationType=${appType}&startDate=${startDate?.toISOString() || ''}&endDate=${endDate?.toISOString() || ''}`,
      );
    }

    onClose();
  };

  const renderButtons = () => {
    if (!action) {
      return [
        { label: '새로 만들기', onClick: () => setAction('formcreate') },
        { label: '기존 폼 수정', onClick: () => setAction('edit') },
      ];
    }

    if (!selectedCategory) {
      return [CATEGORIES.FORM, CATEGORIES.SURVEY].map((category) => ({
        label: category,
        onClick: () => handleCategorySelect(category),
      }));
    }

    if (selectedCategory && !selectedUserType) {
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
      selectedCategory === CATEGORIES.FORM &&
      selectedUserType === USER_TYPES.STANDARD
    ) {
      return [
        {
          label: '사전 등록',
          onClick: () => handleRegistrationTypeSelect('PRE'),
        },
        {
          label: '현장 등록',
          onClick: () => handleRegistrationTypeSelect('FIELD'),
        },
      ];
    }

    return [];
  };

  return (
    <div className="w-[656px] rounded-sm bg-white p-28">
      <div className="flex flex-col gap-[90px]">
        <div className="flex flex-col gap-12">
          <div className="flex w-full justify-between">
            <p className="text-h2b mobile:text-body1b">{text}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-m-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center"
            >
              <XMark />
            </button>
          </div>
          {/* 여기서 만드는 폼은 사전·현장 등록용이다. 프로그램·연수 신청 폼은 회차에 연결하는 별도 폼이다 */}
          <p className="text-caption1r text-gray-500">
            여기서는 사전·현장 등록용 폼과 만족도 조사를 다룹니다. 프로그램·연수
            신청 폼은{' '}
            <Link
              href={getRegistrationRoutes(params).programForms}
              className="text-main-600 underline"
              onClick={onClose}
            >
              프로그램 페이지의 신청 폼 탭
            </Link>
            에서 만들고 회차·모집 탭의 회차에 연결합니다.
          </p>
        </div>
        <div className="flex items-start gap-12">
          {!hasPeriod && (
            <>
              <SelectDateInput
                placeholder="시작 날짜"
                onChange={setStartDate}
                value={startDate}
              />
              <SelectDateInput
                placeholder="마감 날짜"
                onChange={setEndDate}
                value={endDate}
              />
            </>
          )}

          {hasPeriod &&
            renderButtons().map((button, index) => (
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
