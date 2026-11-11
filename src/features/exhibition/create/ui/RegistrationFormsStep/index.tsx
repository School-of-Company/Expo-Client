'use client';

import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { FormBuilder } from '@/features/form-builder';
import { DateTimeInput } from '@/features/registration/common';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { ToggleButton } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';
import {
  REGISTRATION_LABEL,
  REGISTRATION_PARTICIPANTS,
} from '../../lib/registrationForm';

interface Props {
  register: UseFormRegister<ExhibitionFormData>;
  watch: UseFormWatch<ExhibitionFormData>;
  setValue: UseFormSetValue<ExhibitionFormData>;
}

/** 참여자군별 등록 폼. 이름·전화번호 등 필수 문항은 미리 넣어 두고 질문을 더할 수 있다 */
const RegistrationFormsStep = ({ register, watch, setValue }: Props) => (
  <>
    {REGISTRATION_PARTICIPANTS.map((participant) => {
      const path = `registrationForms.${participant}` as const;
      const draft = watch(path);
      const set = <K extends keyof typeof draft>(
        key: K,
        value: (typeof draft)[K],
      ) => setValue(`${path}.${key}`, value as never, { shouldDirty: true });
      return (
        <div
          key={participant}
          className="space-y-24 rounded-sm border-1 border-solid border-gray-200 px-[30px] py-[24px] mobile:px-16"
        >
          <div className="flex items-center justify-between gap-16">
            <p className="text-h2b text-black">
              {REGISTRATION_LABEL[participant]}
            </p>
            <ToggleButton
              value={draft.enabled}
              onChange={(enabled) => set('enabled', enabled)}
            />
          </div>
          {draft.enabled && (
            <>
              <div className="flex gap-24">
                {(
                  [
                    ['pre', '사전등록'],
                    ['field', '현장등록 (박람회 기간)'],
                  ] as const
                ).map(([key, text]) => (
                  <label
                    key={key}
                    className="flex items-center gap-8 text-body2r text-black"
                  >
                    <input
                      type="checkbox"
                      checked={draft[key]}
                      onChange={(e) => set(key, e.target.checked)}
                    />
                    {text}
                  </label>
                ))}
              </div>
              {draft.pre && (
                <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
                  {(
                    [
                      ['사전등록 시작', 'preStartedAt'],
                      ['사전등록 마감', 'preEndedAt'],
                    ] as const
                  ).map(([text, key]) => (
                    <div key={key} className="space-y-8">
                      <p className="text-sm text-gray-600">{text}</p>
                      <DateTimeInput
                        value={draft[key]}
                        onChange={(value) => set(key, value)}
                      />
                    </div>
                  ))}
                </div>
              )}
              <TextArea
                title="개인정보 동의 안내문"
                placeholder="개인정보 동의 안내문을 입력해주세요."
                maxLength={2000}
                registration={register(`${path}.informationText`)}
                row={1}
                value={draft.informationText}
              />
              <FormBuilder
                value={draft.dynamicForm}
                onChange={(dynamicForm) => set('dynamicForm', dynamicForm)}
              />
            </>
          )}
        </div>
      );
    })}
  </>
);

export default RegistrationFormsStep;
