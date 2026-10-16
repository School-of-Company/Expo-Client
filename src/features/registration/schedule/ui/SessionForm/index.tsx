'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { Button, Input, ToggleButton } from '@/shared/ui';
import {
  DateTimeInput,
  patchPreregisterSession,
  PreregisterSession,
  postPreregisterSession,
  useScheduleMutation,
} from '../../../common';
import {
  EMPTY_SESSION_FORM,
  SessionForm,
  toCount,
  toSessionDefinition,
  toSessionForm,
  validateSessionForm,
} from '../../model/sessionForm';
import { Field } from '../PolicyFields';
import ScheduleModal from '../ScheduleModal';

interface SessionFormProps {
  expoId: string;
  /** 없으면 새 회차를 만든다 */
  session?: PreregisterSession;
  /** 저장이 중단돼 서버의 재시도가 필요한 실패였을 때 */
  onRetryable: (id: number) => void;
  onClose: () => void;
}

/** 변경이 서버에 남아 재시도로 이어서 처리할 수 있는 실패 */
const isRetryable = (error: unknown) => {
  const status = getErrorStatus(error);
  return status === 502 || status === 503;
};

const SessionFormPanel = ({
  expoId,
  session,
  onRetryable,
  onClose,
}: SessionFormProps) => {
  const [form, setForm] = useState<SessionForm>(() =>
    session ? toSessionForm(session) : EMPTY_SESSION_FORM,
  );
  const { mutate: save, isPending } = useScheduleMutation(
    expoId,
    async (value: SessionForm) => {
      const definition = toSessionDefinition(value);
      if (!session) {
        await postPreregisterSession(expoId, definition);
        return;
      }
      try {
        await patchPreregisterSession(
          expoId,
          session.id,
          session.revision,
          definition,
        );
      } catch (error) {
        if (isRetryable(error)) onRetryable(session.id);
        throw error;
      }
    },
    session ? '사전등록 회차를 수정했습니다.' : '사전등록 회차를 만들었습니다.',
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
    save(form);
  };

  return (
    <ScheduleModal
      title={session ? `${session.title} 수정` : '사전등록 회차 추가'}
      onClose={onClose}
      canClose={!isPending}
      footer={
        <>
          <Button variant="gray" width="120px" onClick={onClose}>
            취소
          </Button>
          <Button width="200px" disabled={isPending} onClick={handleSubmit}>
            {isPending ? '저장 중...' : session ? '수정 저장' : '추가'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-16 gap-y-20 mobile:grid-cols-1">
        <div className="col-span-2 mobile:col-span-1">
          <Field label="회차명">
            <Input
              placeholder="예: 10월 31일(토) 오전"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </Field>
        </div>
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
        <div className="col-span-2 mobile:col-span-1">
          <Field label="장소">
            <Input
              placeholder="장소를 입력해주세요."
              value={form.place}
              onChange={(e) => update({ place: e.target.value })}
            />
          </Field>
        </div>
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
        <Field label="취소 마감 (비우면 취소 불가)">
          <DateTimeInput
            value={form.cancelEndedAt}
            onChange={(cancelEndedAt) => update({ cancelEndedAt })}
          />
        </Field>
        <Field label="모집 마감">
          <div className="flex h-[48px] items-center justify-between rounded-sm border-1 border-solid border-gray-200 px-16">
            <p className="text-body2r text-gray-500">
              {form.closed ? '신청을 받지 않습니다' : '신청을 받고 있습니다'}
            </p>
            <ToggleButton
              label="모집 마감"
              value={form.closed}
              onChange={(closed) => update({ closed })}
            />
          </div>
        </Field>
      </div>
    </ScheduleModal>
  );
};

export default SessionFormPanel;
