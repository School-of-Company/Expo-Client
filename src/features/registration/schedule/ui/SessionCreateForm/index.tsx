'use client';

import { useState } from 'react';
import {
  RegistrationProgram,
  RegistrationSession,
  RegistrationSessionCreateRequest,
} from '@/shared/types/registration/type';
import { Button, Input } from '@/shared/ui';
import SelectDateInput from '@/shared/ui/SelectDateInput';
import SelectTimeInput from '@/shared/ui/SelectTimeInput';
import {
  DATE_PICKER_PORTAL_ID,
  dateFromString,
  dateToString,
  RegistrationSelect,
  timeFromString,
  timeToString,
  useCreateSession,
} from '../../../common';
import { FieldLabel } from '../ScheduleSection';

interface SessionCreateFormProps {
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
  onClose: () => void;
}

const INITIAL_FORM: RegistrationSessionCreateRequest = {
  programId: 0,
  round: 1,
  name: '',
  date: '',
  startTime: '',
  endTime: '',
  place: '',
  capacity: 0,
  waitlistCapacity: 0,
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-[10px]">
    <FieldLabel>{label}</FieldLabel>
    {children}
  </div>
);

const SessionCreateForm = ({
  programs,
  sessions,
  onClose,
}: SessionCreateFormProps) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const { mutate: createSession, isPending } = useCreateSession(onClose);

  const update = (patch: Partial<RegistrationSessionCreateRequest>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleProgramChange = (programId: number) => {
    const rounds = sessions
      .filter((session) => session.programId === programId)
      .map(({ round }) => round);
    update({ programId, round: Math.max(0, ...rounds) + 1 });
  };

  return (
    <div className="space-y-[20px] rounded-sm border-1 border-solid border-gray-200 px-30 py-20 mobile:px-16">
      <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
        <Field label="프로그램">
          <RegistrationSelect
            value={String(form.programId)}
            onChange={(value) => handleProgramChange(Number(value))}
            options={[
              { value: '0', label: '선택해주세요' },
              ...programs.map(({ id, name }) => ({
                value: String(id),
                label: name,
              })),
            ]}
          />
        </Field>
        <Field label="회차">
          <Input
            type="number"
            min={1}
            value={form.round}
            onChange={(e) => update({ round: Number(e.target.value) })}
          />
        </Field>
        <Field label="회차명">
          <Input
            placeholder="예: 10월 31일(토) 오전"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </Field>
        <Field label="장소">
          <Input
            placeholder="장소를 입력해주세요."
            value={form.place}
            onChange={(e) => update({ place: e.target.value })}
          />
        </Field>
        <Field label="운영일">
          <SelectDateInput
            value={dateFromString(form.date)}
            onChange={(date) =>
              update({ date: date ? dateToString(date) : '' })
            }
            placeholder="운영일"
            portalId={DATE_PICKER_PORTAL_ID}
          />
        </Field>
        <Field label="시작 / 종료">
          <div className="flex gap-8 [&_input]:h-[48px]">
            <SelectTimeInput
              value={timeFromString(form.startTime)}
              onChange={(time) =>
                update({ startTime: time ? timeToString(time) : '' })
              }
              placeholder="시작"
              portalId={DATE_PICKER_PORTAL_ID}
            />
            <SelectTimeInput
              value={timeFromString(form.endTime)}
              onChange={(time) =>
                update({ endTime: time ? timeToString(time) : '' })
              }
              placeholder="종료"
              portalId={DATE_PICKER_PORTAL_ID}
            />
          </div>
        </Field>
        <Field label="정원">
          <Input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => update({ capacity: Number(e.target.value) })}
          />
        </Field>
        <Field label="대기 정원">
          <Input
            type="number"
            min={0}
            value={form.waitlistCapacity}
            onChange={(e) =>
              update({ waitlistCapacity: Number(e.target.value) })
            }
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-16">
        <Button variant="gray" onClick={onClose}>
          취소
        </Button>
        <Button disabled={isPending} onClick={() => createSession(form)}>
          회차 추가
        </Button>
      </div>
    </div>
  );
};

export default SessionCreateForm;
