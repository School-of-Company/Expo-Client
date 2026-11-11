import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { handleDateChange } from '@/features/exhibition/common/lib/handleDateChange';
import {
  EMPTY_PROGRAM_POLICY_DRAFT,
  getPolicyDraftProblem,
} from '@/features/exhibition/create/lib/programPolicy';
import { DateTimeInput } from '@/features/registration/common';
import { OCCUPATION_LABEL } from '@/features/registration/common/model/ledger';
import { XMark } from '@/shared/assets/icons';
import {
  isDateTimeRangeInvalid,
  isProgramTitleTooLong,
  PROGRAM_TITLE_MAX_LENGTH,
} from '@/shared/config/validation';
import { useModalDialog } from '@/shared/model';
import { ModalProps, ProgramPolicyDraft } from '@/shared/types/exhibition/type';
import { Button, Input, ToggleButton } from '@/shared/ui';
import SelectDateInput from '@/shared/ui/SelectDateInput';
import SelectTimeInput from '@/shared/ui/SelectTimeInput';
import type { AdminOccupation } from '@/features/registration/common/api/ledgerApi';

// 'yyyy-MM-dd HH:mm' 문자열 <-> Date. 비어 있거나 형식이 아니면 null
const toDate = (value: string) => {
  const date = value ? new Date(value.replace(' ', 'T')) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const combine = (date: Date | null, time: Date | null) => {
  if (!date || !time) return '';
  const merged = new Date(date);
  merged.setHours(time.getHours(), time.getMinutes());
  let formatted = '';
  handleDateChange((_, value) => (formatted = value), '', merged);
  return formatted;
};

const OCCUPATIONS = Object.keys(OCCUPATION_LABEL) as AdminOccupation[];

const Modal = ({
  fieldName,
  initial,
  withPolicy = false,
  onSubmit,
  onClose,
}: ModalProps) => {
  const dialogRef = useModalDialog({ onClose });
  const isTraining = fieldName === 'trainings';
  const label = isTraining ? '연수' : '참가자 프로그램';

  const [title, setTitle] = useState(initial?.title ?? '');
  // 날짜와 시간은 따로 고르므로 따로 보관하고 저장할 때 합친다
  const initialStarted = toDate(initial?.startedAt ?? '');
  const initialEnded = toDate(initial?.endedAt ?? '');
  const [startedDate, setStartedDate] = useState(initialStarted);
  const [startedTime, setStartedTime] = useState(initialStarted);
  const [endedDate, setEndedDate] = useState(initialEnded);
  const [endedTime, setEndedTime] = useState(initialEnded);
  const [place, setPlace] = useState(initial?.place ?? '');
  const [isEssential, setIsEssential] = useState(
    initial?.category === 'ESSENTIAL',
  );
  // 새 회차는 신청을 받는 것이 기본이다. 이미 끄고 저장한 회차는 꺼진 채로 연다
  const [hasPolicy, setHasPolicy] = useState(initial ? !!initial.policy : true);
  const [policy, setPolicy] = useState<ProgramPolicyDraft>(
    initial?.policy ?? EMPTY_PROGRAM_POLICY_DRAFT,
  );
  const updatePolicy = (patch: Partial<ProgramPolicyDraft>) =>
    setPolicy((prev) => ({ ...prev, ...patch }));
  // 두 칸으로 열면 왼쪽 칸이 좁아 기본 정보는 한 줄에 하나씩 둔다
  const fieldGrid = withPolicy
    ? 'grid-cols-1'
    : 'grid-cols-2 mobile:grid-cols-1';

  const handleSubmit = () => {
    const startedAt = combine(startedDate, startedTime);
    const endedAt = combine(endedDate, endedTime);
    const error = !title.trim()
      ? `${label} 이름을 입력해주세요.`
      : isProgramTitleTooLong(title)
        ? `프로그램명은 ${PROGRAM_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`
        : !startedAt || !endedAt
          ? '시작·마감 날짜와 시간을 모두 선택해주세요.'
          : isDateTimeRangeInvalid(startedAt, endedAt)
            ? '프로그램 종료 일시는 시작 일시보다 늦어야 합니다.'
            : withPolicy && hasPolicy
              ? getPolicyDraftProblem(policy)
              : null;
    if (error) {
      toast.error(error);
      return;
    }
    onSubmit({
      title: title.trim(),
      startedAt,
      endedAt,
      // 비우면 기존 장소는 지우고, 원래 없던 장소는 보내지 않는다
      place: place.trim() || (initial?.place ? '' : undefined),
      ...(isTraining ? { category: isEssential ? 'ESSENTIAL' : 'CHOICE' } : {}),
      ...(withPolicy ? { policy: hasPolicy ? policy : null } : {}),
    });
  };

  return (
    <div
      className="fixed inset-0 z-10 overflow-y-auto px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      {/* 내용이 짧으면 가운데, 길면 위에서부터 보이고 바깥이 스크롤된다 */}
      <div className="flex min-h-full items-center justify-center py-[24px]">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${label} ${initial ? '수정' : '추가'}`}
          tabIndex={-1}
          // 신청 설정까지 있으면 넓게 열어 두 칸으로 나눠 스크롤 없이 보이게 한다
          className={`w-full ${withPolicy ? 'max-w-[1040px]' : 'max-w-[600px]'} space-y-[24px] rounded-lg bg-white p-[24px] outline-none`}
        >
          <div className="flex items-center justify-between">
            <p className="text-h3b text-black">
              {label} {initial ? '수정' : '추가'}
            </p>
            <button type="button" aria-label="닫기" onClick={onClose}>
              <XMark />
            </button>
          </div>

          <div
            className={
              withPolicy
                ? 'grid grid-cols-2 items-start gap-32 tablet:grid-cols-1'
                : ''
            }
          >
            <div className="space-y-16">
              <div className={`grid gap-16 ${fieldGrid}`}>
                <div className="space-y-8">
                  <p className="text-left text-sm text-gray-600">이름</p>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`${label} 이름을 입력해주세요`}
                    autoFocus
                  />
                </div>
                <div className="space-y-8">
                  <p className="text-left text-sm text-gray-600">장소 (선택)</p>
                  <Input
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="비우면 '장소 추후 안내'로 표시됩니다."
                  />
                </div>
              </div>
              <div className={`grid gap-16 ${fieldGrid}`}>
                {(
                  [
                    [
                      '시작 시간',
                      startedDate,
                      setStartedDate,
                      startedTime,
                      setStartedTime,
                    ],
                    [
                      '마감 시간',
                      endedDate,
                      setEndedDate,
                      endedTime,
                      setEndedTime,
                    ],
                  ] as const
                ).map(([text, date, setDate, time, setTime]) => (
                  <div key={text} className="space-y-8">
                    <p className="text-left text-sm text-gray-600">{text}</p>
                    <div className="flex items-center gap-12">
                      <SelectDateInput
                        value={date}
                        onChange={setDate}
                        placeholder="날짜"
                        inputClassName="px-8 py-4"
                        emptyCenter={true}
                      />
                      <SelectTimeInput
                        value={time}
                        onChange={setTime}
                        placeholder="시간"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {isTraining && (
                <label className="flex items-center gap-12 text-caption1r text-gray-500">
                  <input
                    type="checkbox"
                    checked={isEssential}
                    onChange={(e) => setIsEssential(e.target.checked)}
                  />
                  이 프로그램 필수로 참여합니다
                </label>
              )}
            </div>

            {withPolicy && (
              <div className="space-y-16 border-l-1 border-solid border-gray-200 pl-32 tablet:border-l-0 tablet:border-t-1 tablet:pl-0 tablet:pt-[24px]">
                <div className="flex items-center justify-between gap-16">
                  <div className="space-y-4">
                    <p className="text-body2b text-black">온라인 신청 받기</p>
                    <p className="break-keep text-caption1r text-gray-500">
                      {hasPolicy
                        ? '질문은 다음 단계에서 만듭니다.'
                        : '온라인으로 신청할 수 없습니다.'}
                    </p>
                  </div>
                  <ToggleButton value={hasPolicy} onChange={setHasPolicy} />
                </div>
                {hasPolicy && (
                  <>
                    <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
                      {(
                        [
                          ['모집 시작', 'applicationStartedAt'],
                          ['모집 종료', 'applicationEndedAt'],
                          ['취소 마감', 'cancelEndedAt'],
                          ['대기 승급 마감', 'promotionEndedAt'],
                        ] as const
                      ).map(([text, key]) => (
                        <div key={key} className="space-y-8">
                          <p className="text-left text-sm text-gray-600">
                            {text}
                          </p>
                          <DateTimeInput
                            size="small"
                            value={policy[key]}
                            onChange={(value) => updatePolicy({ [key]: value })}
                          />
                        </div>
                      ))}
                      {(
                        [
                          ['사전 접수 정원', 'preRegistrationCapacity', 1],
                          ['대기 정원', 'waitingCapacity', 0],
                        ] as const
                      ).map(([text, key, min]) => (
                        <div key={key} className="space-y-8">
                          <p className="text-left text-sm text-gray-600">
                            {text}
                          </p>
                          <Input
                            type="number"
                            min={min}
                            // 0 을 칸에 남기면 이어 쓴 숫자가 '05' 처럼 붙으므로 0 은 빈칸으로 보인다(일정 관리와 같다)
                            value={policy[key] || ''}
                            placeholder="0"
                            onChange={(e) =>
                              updatePolicy({
                                [key]: e.target.valueAsNumber || 0,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-8">
                      <p className="text-left text-sm text-gray-600">
                        신청 가능 직업 (하나 이상)
                      </p>
                      <div className="flex flex-wrap gap-8">
                        {OCCUPATIONS.map((occupation) => {
                          const selected =
                            policy.allowedOccupations.includes(occupation);
                          return (
                            <button
                              key={occupation}
                              type="button"
                              aria-pressed={selected}
                              onClick={() =>
                                updatePolicy({
                                  allowedOccupations: selected
                                    ? policy.allowedOccupations.filter(
                                        (item) => item !== occupation,
                                      )
                                    : [
                                        ...policy.allowedOccupations,
                                        occupation,
                                      ],
                                })
                              }
                              className={`rounded-full border-1 border-solid px-12 py-6 text-caption1r ${
                                selected
                                  ? 'border-main-600 bg-main-600 text-white'
                                  : 'border-gray-200 text-gray-500'
                              }`}
                            >
                              {OCCUPATION_LABEL[occupation]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-16">
            <Button variant="gray" type="button" onClick={onClose}>
              취소
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {initial ? '수정' : '추가'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
