import React, { useEffect, useRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { DeleteButton } from '@/entities/form';
import { preventEvent } from '@/shared/model';

interface PrivacyConsentFormProps {
  placeholder: string;
  registration: UseFormRegisterReturn;
  row: number;
  value?: string;
  onRemove?: () => void;
}

const PrivacyConsentForm = ({
  placeholder,
  registration,
  row,
  value = '',
  onRemove,
}: PrivacyConsentFormProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    registration.onChange(e);
  };
  return (
    <div className="space-y-20 rounded-sm border-1 border-solid border-gray-200 px-32 py-18">
      <div className="flex items-center justify-between border-b-1 border-solid border-gray-100 py-14">
        <p className="text-h3b text-black mobile:text-body2b">
          개인정보 동의 안내 문장을 입력하세요
        </p>
        {onRemove && (
          <DeleteButton
            onClick={(e: React.MouseEvent) => {
              preventEvent(e);
              onRemove();
            }}
          />
        )}
      </div>
      <textarea
        ref={(e) => {
          registration.ref(e);
          textareaRef.current = e;
        }}
        placeholder={placeholder}
        className="w-full resize-none overflow-hidden leading-[32px] text-black caret-main-500"
        onBlur={registration.onBlur}
        name={registration.name}
        rows={row}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default PrivacyConsentForm;
