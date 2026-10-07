'use client';

import { useState } from 'react';
import { RegistrationProgramCreateRequest } from '@/shared/types/registration/type';
import { Button, Input } from '@/shared/ui';
import {
  PROGRAM_TYPE_LABEL,
  RegistrationSelect,
  useCreateProgram,
} from '../../../common';
import { FieldLabel } from '../ScheduleSection';

const INITIAL_FORM: RegistrationProgramCreateRequest = {
  code: '',
  name: '',
  type: 'GENERAL',
  maxSessionsPerPerson: 1,
};

const ProgramCreateForm = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const { mutate: createProgram, isPending } = useCreateProgram(onClose);

  return (
    <div className="space-y-[20px] rounded-sm border-1 border-solid border-gray-200 px-30 py-20 mobile:px-16">
      <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
        <div className="space-y-[10px]">
          <FieldLabel>코드</FieldLabel>
          <Input
            placeholder="PROGRAM_CODE"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase().trim() })
            }
          />
        </div>
        <div className="space-y-[10px]">
          <FieldLabel>프로그램명</FieldLabel>
          <Input
            placeholder="프로그램명을 입력해주세요."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-[10px]">
          <FieldLabel>유형</FieldLabel>
          <RegistrationSelect
            value={form.type}
            onChange={(type) =>
              setForm({
                ...form,
                type: type as RegistrationProgramCreateRequest['type'],
              })
            }
            options={Object.entries(PROGRAM_TYPE_LABEL).map(
              ([value, label]) => ({ value, label }),
            )}
          />
        </div>
        <div className="space-y-[10px]">
          <FieldLabel>1인 최대 회차</FieldLabel>
          <Input
            type="number"
            min={1}
            value={form.maxSessionsPerPerson}
            onChange={(e) =>
              setForm({ ...form, maxSessionsPerPerson: Number(e.target.value) })
            }
          />
        </div>
      </div>
      <p className="text-caption1r text-gray-500">
        등록 직후에는 신청이 닫혀 있습니다. 회차를 추가한 뒤 신청을 열어주세요.
      </p>
      <div className="grid grid-cols-2 gap-16">
        <Button variant="gray" onClick={onClose}>
          취소
        </Button>
        <Button disabled={isPending} onClick={() => createProgram(form)}>
          프로그램 등록
        </Button>
      </div>
    </div>
  );
};

export default ProgramCreateForm;
