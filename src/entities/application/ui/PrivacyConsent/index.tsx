'use client';

import { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import { ModalLayout } from '@/widgets/layout';
import PrivacyConsentModal from '../PrivacyConsentModal';

interface PrivacyConsentProps {
  content: string;
  watch: UseFormWatch<FormValues & { privacyConsent?: boolean }>;
  setValue: UseFormSetValue<FormValues & { privacyConsent?: boolean }>;
}

const PrivacyConsent = ({ content, watch, setValue }: PrivacyConsentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const consentChecked = watch('privacyConsent') === true;
  // 안내문을 쓰지 않은 예전 폼은 빈 창을 띄우지 않는다(#943).
  // ponytail: 이때 기본 동의 문구를 보일지, 접수를 막을지는 운영 측 법적 문안 확인 뒤 정한다
  const hasContent = content.trim().length > 0;

  const toggleConsent = () => {
    setValue('privacyConsent', !consentChecked);
  };

  return (
    <div>
      <div className="flex items-center justify-between px-4">
        {hasContent ? (
          <p
            className="cursor-pointer text-body1b text-main-600"
            onClick={() => setIsModalOpen(true)}
          >
            개인 정보 제공 동의 여부
          </p>
        ) : (
          <p className="text-body1b text-black">개인 정보 제공 동의 여부</p>
        )}
        <button type="button" onClick={toggleConsent}>
          {consentChecked ? <CheckedBoxIcon /> : <CheckBoxIcon />}
        </button>
      </div>

      {isModalOpen && hasContent && (
        <ModalLayout
          label="개인정보 동의"
          onClose={() => setIsModalOpen(false)}
        >
          <PrivacyConsentModal
            content={content}
            onClose={() => setIsModalOpen(false)}
          />
        </ModalLayout>
      )}
    </div>
  );
};

export default PrivacyConsent;
