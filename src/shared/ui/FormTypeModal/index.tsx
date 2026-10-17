'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { XMark } from '@/shared/assets/icons';
import { getRegistrationRoutes } from '@/shared/config';
import { ApplicationType } from '@/shared/types/exhibition/type';
import Button from '../Button';
import SelectDateInput from '../SelectDateInput';

const CATEGORIES = {
  EXHIBITION: '박람회',
  FORM: '등록용 폼',
  SURVEY: '만족도 조사',
  PROGRAM_FORM: '프로그램 폼',
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
  // 날짜는 등록용 폼의 신청 기간으로만 쓰이므로, 폼을 만들거나 고칠 때 등록용 폼을 고른 뒤에만 묻는다
  const needsDate =
    (modalType === 'formcreate' || modalType === 'edit') &&
    selectedCategory === CATEGORIES.FORM;
  const isDateReady = !needsDate || (startDate && endDate);

  const handleCategorySelect = (category: string) => {
    if (category === CATEGORIES.EXHIBITION) {
      router.push(`/exhibition/edit/${params}`);
      return;
    }

    // 프로그램 폼은 참가자 유형·날짜 없이 만들고, 신청 기간은 만들기 화면에서 정한다
    if (category === CATEGORIES.PROGRAM_FORM) {
      // 뒤로 가기가 박람회 상세로 돌아오도록 출발지를 넘긴다
      router.push(
        `${getRegistrationRoutes(params).programFormNew}?returnTo=detail`,
      );
      onClose();
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
    const baseURL = window.location.origin;

    if (modalType === 'edit' && selectedFormType) {
      router.push(
        `/form/edit/${params}?type=${userType}&mode=${selectedFormType}&applicationType=${appType}&startDate=${startDate?.toISOString() || ''}&endDate=${endDate?.toISOString() || ''}`,
      );
    } else if (modalType === 'formcreate' && selectedFormType) {
      router.push(
        `/form/create/${params}?type=${userType}&mode=${selectedFormType}&applicationType=${appType}&startDate=${startDate?.toISOString() || ''}&endDate=${endDate?.toISOString() || ''}`,
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
    } else if (modalType === 'FIELD') {
      router.push(
        `/exhibition/access-qr/${params}?userType=${userType}&applicationType=${appType}`,
      );
    }

    onClose();
  };

  const renderButtons = () => {
    if (modalType === 'FIELD' && !selectedUserType) {
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

    if (modalType === 'FIELD' && selectedUserType === USER_TYPES.STANDARD) {
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

    if (
      (modalType === 'edit' ||
        modalType === 'formcreate' ||
        modalType === 'share') &&
      !selectedCategory
    ) {
      const categories =
        modalType === 'edit'
          ? [CATEGORIES.EXHIBITION, CATEGORIES.FORM, CATEGORIES.SURVEY]
          : modalType === 'formcreate'
            ? [CATEGORIES.FORM, CATEGORIES.SURVEY, CATEGORIES.PROGRAM_FORM]
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
          {/* 프로그램 폼은 회차에 연결해야 신청을 받는다. 수정은 프로그램 폼 관리에서 한다 */}
          {modalType === 'formcreate' && (
            <p className="text-caption1r text-gray-500">
              프로그램 폼은 만든 뒤 일정·모집의 회차에 연결해야 신청을 받을 수
              있습니다.
            </p>
          )}
          {modalType === 'edit' && (
            <p className="text-caption1r text-gray-500">
              프로그램 폼은{' '}
              <Link
                href={getRegistrationRoutes(params).programForms}
                className="text-main-600 underline"
                onClick={onClose}
              >
                프로그램 폼 관리
              </Link>
              에서 수정합니다.
            </p>
          )}
        </div>
        <div className="flex items-center gap-12">
          {!isDateReady && (
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

          {isDateReady &&
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
