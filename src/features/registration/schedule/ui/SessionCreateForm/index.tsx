'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, ToggleButton } from '@/shared/ui';
import {
  DateTimeInput,
  postPreregisterSession,
  useScheduleMutation,
} from '../../../common';
import {
  EMPTY_SESSION_FORM,
  SessionForm,
  toCount,
  toSessionDefinition,
  validateSessionForm,
} from '../../model/sessionForm';
import { Field } from '../PolicyFields';

interface SessionCreateFormProps {
  expoId: string;
  onClose: () => void;
}

const SessionCreateForm = ({ expoId, onClose }: SessionCreateFormProps) => {
  const [form, setForm] = useState<SessionForm>(EMPTY_SESSION_FORM);
  const { mutate: createSession, isPending } = useScheduleMutation(
    expoId,
    (value: SessionForm) =>
      postPreregisterSession(expoId, toSessionDefinition(value)),
    '사전등록 회차를 만들었습니다.',
    onClose,
  );

  const update = (patch: Partial<SessionForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    const error = validateSessionForm(form);
    if (error) {
      toast.error(error);
      return;
    }
    createSession(form);
  };

  return (
    <div className="space-y-[20px] rounded-sm border-1 border-solid border-gray-200 px-30 py-20 mobile:px-16">
      <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
        <Field label="회차명">
          <Input
            placeholder="예: 10월 31일(토) 오전"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
          />
        </Field>
        <Field label="장소">
          <Input
            placeholder="장소를 입력해주세요."
            value={form.place}
            onChange={(e) => update({ place: e.target.value })}
          />
        </Field>
        <Field label="정원">
          <Input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => update({ capacity: toCount(e.target.value) })}
          />
        </Field>
        <Field label="대기 정원">
          <Input
            type="number"
            min={0}
            value={form.waitingCapacity}
            onChange={(e) =>
              update({ waitingCapacity: toCount(e.target.value) })
            }
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
        <Field label="시작">
          <DateTimeInput
            value={form.startedAt}
            onChange={(startedAt) => update({ startedAt })}
          />
        </Field>
        <Field label="종료">
          <DateTimeInput
            value={form.endedAt}
            onChange={(endedAt) => update({ endedAt })}
          />
        </Field>
        <Field label="취소 마감 (비우면 취소 불가)">
          <DateTimeInput
            value={form.cancelEndedAt}
            onChange={(cancelEndedAt) => update({ cancelEndedAt })}
          />
        </Field>
        <Field label="모집 마감">
          <div className="flex h-[48px] items-center">
            <ToggleButton
              value={form.closed}
              onChange={(closed) => update({ closed })}
            />
          </div>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-16">
        <Button variant="gray" onClick={onClose}>
          취소
        </Button>
        <Button disabled={isPending} onClick={handleSubmit}>
          {isPending ? '추가 중...' : '회차 추가'}
        </Button>
      </div>
    </div>
  );
};

export default SessionCreateForm;
