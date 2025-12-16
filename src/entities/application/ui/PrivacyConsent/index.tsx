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

  const toggleConsent = () => {
    setValue('privacyConsent', !consentChecked);
  };

  return (
    <div>
      <div className="flex items-center justify-between px-4">
        <p
          className="cursor-pointer text-body1b text-main-600"
          onClick={() => setIsModalOpen(true)}
        >
          개인 정보 제공 동의 여부
        </p>
        <button type="button" onClick={toggleConsent}>
          {consentChecked ? <CheckedBoxIcon /> : <CheckBoxIcon />}
        </button>
      </div>

      {isModalOpen && (
        <ModalLayout>
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
