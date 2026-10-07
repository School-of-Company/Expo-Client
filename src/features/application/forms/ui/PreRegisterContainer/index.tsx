'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { withLoading } from '@/shared/hocs';
import { Input } from '@/shared/ui';
import { ManagedParticipant, PreRegisterSession } from '../../api/preRegister';
import {
  MAX_PARTICIPANTS,
  NEEDS_AFFILIATION,
  PARTICIPANT_TYPE_LABEL,
  ParticipantType,
  REGIONS,
} from '../../constant/participant';
import { usePreRegister } from '../../model/usePreRegister';

interface NewParticipantValues {
  name: string;
  region: string;
  participantType: ParticipantType | '';
  affiliation: string;
}

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (value: number) => String(value).padStart(2, '0');
const time = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** "10월 31일 (토) 09:30 ~ 12:30" */
const formatSession = (startedAt: string, endedAt: string) => {
  const start = new Date(startedAt);
  return `${start.getMonth() + 1}월 ${start.getDate()}일 (${WEEKDAY[start.getDay()]}) ${time(start)} ~ ${time(new Date(endedAt))}`;
};

const getSessionStatus = (session: PreRegisterSession) => {
  const remaining = session.capacity - session.confirmedCount;
  const waitingRemaining = session.waitingCapacity - session.waitingCount;

  if (remaining > 0)
    return {
      canApply: true,
      label: `현재 신청 가능 · 잔여 ${remaining.toLocaleString()}명`,
    };
  if (waitingRemaining > 0)
    return {
      canApply: true,
      label: `정원 마감 · 대기 신청 가능 · 대기 잔여 ${waitingRemaining.toLocaleString()}명`,
    };
  return { canApply: false, label: '신청 마감' };
};

const describe = ({
  region,
  participantType,
  affiliation,
}: ManagedParticipant) =>
  [region, PARTICIPANT_TYPE_LABEL[participantType], affiliation]
    .filter(Boolean)
    .join(' · ');

const selectClassName =
  'w-full rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-12 text-body2r text-black outline-none';

const PreRegisterContainer = ({
  expoId,
  sessionId,
}: {
  expoId: string;
  sessionId: string;
}) => {
  const { data, isLoading, apply, isApplying } = usePreRegister(
    expoId,
    sessionId,
  );
  // 'new' = 새 참가자 추가
  const [selected, setSelected] = useState<number | 'new' | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewParticipantValues>({
    defaultValues: {
      name: '',
      region: '',
      participantType: '',
      affiliation: '',
    },
  });

  const backHref = `/application/forms/${expoId}`;

  if (!data)
    return withLoading({
      isLoading,
      children: (
        <p className="flex flex-1 items-center justify-center text-body1r text-gray-500">
          신청 정보를 불러오지 못했습니다
        </p>
      ),
    });

  const { session, participants } = data;
  const status = getSessionStatus(session);
  const canAddNew = participants.length < MAX_PARTICIPANTS;
  const selectedParticipant = participants.find(
    (participant) => participant.participantId === selected,
  );
  const participantType = watch('participantType');

  const onSubmit = (values: NewParticipantValues) => {
    if (selectedParticipant) {
      apply(
        { participantId: selectedParticipant.participantId },
        { onSuccess: () => setSelected(null) },
      );
      return;
    }
    apply(
      {
        name: values.name.trim(),
        region: values.region,
        participantType: values.participantType as ParticipantType,
        ...(NEEDS_AFFILIATION.includes(
          values.participantType as ParticipantType,
        )
          ? { affiliation: values.affiliation.trim() }
          : {}),
      },
      {
        onSuccess: () => {
          reset();
          setSelected(null);
        },
      },
    );
  };

  return (
    <div className="mt-30 flex w-full max-w-[816px] flex-col gap-30">
      <div className="flex flex-col gap-8 border-b-1 border-solid border-gray-200 pb-24">
        <p className="text-h2b text-black mobile:text-h3b">
          참가자 선택 및 신청
        </p>
        <p className="text-body2r text-gray-500">
          한 번에 한 명씩 신청합니다. 신청 완료 후 다른 참가자 또는 다른
          프로그램을 다시 신청할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col gap-8 rounded-sm border-1 border-solid border-main-300 bg-main-100 p-24">
        <p className="text-body1b text-black">{session.title}</p>
        <ul className="flex flex-col gap-4 text-body2r text-gray-600">
          <li>일시 · {formatSession(session.startedAt, session.endedAt)}</li>
          <li>
            장소 · {session.place} · 정원 {session.capacity.toLocaleString()}명
            / 대기 {session.waitingCapacity.toLocaleString()}명
          </li>
        </ul>
        <p
          className={`text-body2b ${status.canApply ? 'text-main-600' : 'text-error'}`}
        >
          {status.label}
        </p>
      </div>

      <section className="flex flex-col gap-16">
        <p className="border-b-1 border-solid border-gray-200 pb-12 text-h3b text-black">
          1. 신청할 사람 선택
        </p>

        <div className="flex flex-col gap-12 rounded-sm bg-gray-100 p-18">
          <div className="flex flex-col gap-4 text-body2r text-gray-600">
            <p className="text-body2b text-black">
              특강·골든벨·오디세이 신청 전에는 사전등록이 필요합니다.
            </p>
            <p>
              참가자별로 이름·지역·참가유형을 등록해 주세요. 교원연수는 사전등록
              없이 교직원·예비교사가 신청할 수 있습니다.
            </p>
            <p>
              이미 교원연수만 신청한 참가자가 있다면 해당 카드를 선택해
              사전등록할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center justify-between gap-12 border-t-1 border-solid border-gray-200 pt-12">
            <p className="text-body2r text-gray-600">
              사전등록 {participants.length}명 · 현재 관리 참가자
            </p>
            <p className="text-body2b text-main-600">
              {participants.length}
              <span className="text-gray-400"> / {MAX_PARTICIPANTS}명</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
          {participants.map((participant) => {
            const isSelected = selected === participant.participantId;
            return (
              <button
                key={participant.participantId}
                type="button"
                disabled={participant.isApplied}
                onClick={() => setSelected(participant.participantId)}
                className={`flex flex-col items-start gap-4 rounded-sm border-1 border-solid p-18 text-left ${
                  participant.isApplied
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100'
                    : isSelected
                      ? 'border-main-600 bg-main-100'
                      : 'border-gray-200 bg-white'
                }`}
              >
                <p className="text-caption1r text-gray-500">사전등록 참가자</p>
                <p
                  className={`text-body1b ${participant.isApplied ? 'text-gray-400' : 'text-black'}`}
                >
                  {participant.name}
                </p>
                <p className="text-caption1r text-gray-500">
                  {describe(participant)}
                </p>
                <span
                  className={`mt-8 rounded-sm px-8 py-4 text-caption1b ${
                    participant.isApplied
                      ? 'bg-white text-gray-500'
                      : 'bg-main-100 text-main-600'
                  }`}
                >
                  {participant.isApplied
                    ? '✓ 이 프로그램 신청 완료'
                    : '선택해서 신청'}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            disabled={!canAddNew}
            onClick={() => setSelected('new')}
            className={`flex flex-col items-start gap-4 rounded-sm border-1 p-18 text-left ${
              !canAddNew
                ? 'cursor-not-allowed border-dashed border-gray-200 bg-gray-100'
                : selected === 'new'
                  ? 'border-solid border-main-600 bg-main-100'
                  : 'border-dashed border-gray-300 bg-white'
            }`}
          >
            <p className="text-caption1r text-gray-500">새 사전등록 참가자</p>
            <p
              className={`text-body1b ${canAddNew ? 'text-black' : 'text-gray-400'}`}
            >
              + 새 참가자 추가
            </p>
            <p className="text-caption1r text-gray-500">
              이름·지역·참가유형을 입력해 사전등록합니다.
            </p>
            <span className="mt-8 rounded-sm bg-gray-100 px-8 py-4 text-caption1b text-gray-600">
              {canAddNew
                ? `현재 ${participants.length}명 · ${MAX_PARTICIPANTS - participants.length}명 추가 가능`
                : `최대 ${MAX_PARTICIPANTS}명까지 등록할 수 있어요`}
            </span>
          </button>
        </div>
      </section>

      {selected !== null && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-24"
        >
          <p className="border-b-1 border-solid border-gray-200 pb-12 text-h3b text-black">
            2. 참가자 정보 확인
          </p>

          {selectedParticipant ? (
            <div className="flex flex-col gap-4 rounded-sm border-1 border-solid border-gray-200 p-18">
              <p className="text-body1b text-black">
                {selectedParticipant.name}
              </p>
              <p className="text-body2r text-gray-500">
                {describe(selectedParticipant)}
              </p>
            </div>
          ) : (
            <>
              <label className="flex flex-col gap-8">
                <span className="text-body2b text-black">
                  참가자 이름 <span className="text-error">*</span>
                </span>
                <Input
                  {...register('name', {
                    required: '이름을 입력해 주세요.',
                    validate: (value) =>
                      value.trim() !== '' || '이름을 입력해 주세요.',
                  })}
                  placeholder="이름"
                  error={!!errors.name}
                />
                {errors.name && (
                  <span className="text-caption1r text-error">
                    {errors.name.message}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-8">
                <span className="text-body2b text-black">
                  지역 <span className="text-error">*</span>
                </span>
                <select
                  {...register('region', { required: '지역을 선택해 주세요.' })}
                  className={selectClassName}
                >
                  <option value="">지역 선택</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <span className="text-caption1r text-error">
                    {errors.region.message}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-8">
                <span className="text-body2b text-black">
                  참가 유형 <span className="text-error">*</span>
                </span>
                <select
                  {...register('participantType', {
                    required: '참가 유형을 선택해 주세요.',
                  })}
                  className={selectClassName}
                >
                  <option value="">참가 유형 선택</option>
                  {Object.entries(PARTICIPANT_TYPE_LABEL).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
                {errors.participantType && (
                  <span className="text-caption1r text-error">
                    {errors.participantType.message}
                  </span>
                )}
              </label>

              {participantType &&
                NEEDS_AFFILIATION.includes(participantType) && (
                  <label className="flex flex-col gap-8">
                    <span className="text-body2b text-black">
                      소속 <span className="text-error">*</span>
                    </span>
                    <Input
                      {...register('affiliation', {
                        validate: (value) =>
                          value.trim() !== '' || '소속을 입력해 주세요.',
                      })}
                      placeholder="예: 광주초, 광주교대"
                      error={!!errors.affiliation}
                    />
                    <span className="text-caption1r text-gray-500">
                      QR 하단과 명찰에 &quot;소속 이름&quot;으로 표시됩니다.
                    </span>
                    {errors.affiliation && (
                      <span className="text-caption1r text-error">
                        {errors.affiliation.message}
                      </span>
                    )}
                  </label>
                )}

              <p className="text-caption1r text-gray-500">
                사전등록 정보는 이후 특강·골든벨·연수·오디세이 신청 시 참가자
                선택에 사용됩니다.
              </p>
            </>
          )}

          <div className="flex gap-16 mobile:flex-col-reverse">
            <Link
              href={backHref}
              className="flex-1 rounded-sm bg-gray-100 px-24 py-14 text-center text-body2b text-gray-700"
            >
              프로그램 목록으로
            </Link>
            <button
              type="submit"
              disabled={!status.canApply || isApplying}
              className="flex-1 rounded-sm bg-main-600 px-24 py-14 text-body2b text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isApplying ? '신청 중...' : '신청 완료하기'}
            </button>
          </div>
        </form>
      )}

      {selected === null && (
        <Link
          href={backHref}
          className="self-end rounded-sm border-1 border-solid border-gray-200 px-24 py-14 text-body2b text-gray-700"
        >
          ← 프로그램 목록으로 돌아가기
        </Link>
      )}
    </div>
  );
};

export default PreRegisterContainer;
