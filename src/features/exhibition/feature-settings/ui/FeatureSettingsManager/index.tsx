'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useRegistrationExpo } from '@/features/registration/common';
import { ArrowLeft } from '@/shared/assets/icons';
import { withLoading } from '@/shared/hocs';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { LEAVE_CONFIRM_MESSAGE, useLeaveConfirm } from '@/shared/model';
import { Button, QueryError } from '@/shared/ui';
import {
  ExpoFeatureApplied,
  ExpoFeatureSettings,
} from '../../api/expoFeatures';
import { FEATURE_NOTES, getFeatureLinks } from '../../model/featureLinks';
import {
  useExpoFeatureSettings,
  useSaveExpoFeatureSettings,
} from '../../model/useExpoFeatureSettings';
import { useFeatureDraft } from '../../model/useFeatureDraft';
import FeatureRow from '../FeatureRow';
import PhoneVerificationRow from '../PhoneVerificationRow';

const joinLabels = (keys: string[], labelOf: (key: string) => string) =>
  keys.map(labelOf).join(', ');

const savedMessage = (
  applied: ExpoFeatureApplied | null | undefined,
  labelOf: (key: string) => string,
) => {
  if (!applied?.changed) return '바뀐 설정이 없습니다.';
  const extra = [
    applied.autoEnabled.length > 0 &&
      `함께 켬: ${joinLabels(applied.autoEnabled, labelOf)}`,
    applied.deactivated.length > 0 &&
      `사용 중지: ${joinLabels(applied.deactivated, labelOf)}`,
    applied.reactivated.length > 0 &&
      `다시 사용: ${joinLabels(applied.reactivated, labelOf)}`,
  ].filter(Boolean);
  return ['기능 설정을 저장했습니다.', ...extra].join(' ');
};

interface FeatureSettingsFormProps {
  expoId: string;
  settings: ExpoFeatureSettings;
  isRefetching: boolean;
  refetch: () => void;
}

const FeatureSettingsForm = ({
  expoId,
  settings,
  isRefetching,
  refetch,
}: FeatureSettingsFormProps) => {
  const router = useRouter();
  const draft = useFeatureDraft(settings);
  const { mutate, isPending } = useSaveExpoFeatureSettings(expoId);
  const [saveError, setSaveError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const links = getFeatureLinks(expoId);

  useLeaveConfirm(draft.isDirty);

  useEffect(() => {
    if (saveError) errorRef.current?.focus();
  }, [saveError]);

  const labels = new Map(settings.features.map((f) => [f.key, f.label]));
  const labelOf = (key: string) => labels.get(key) ?? key;
  const { plan } = draft;
  const changedKeys = new Set(draft.changes.map((c) => c.key));
  const autoKeys = new Set(plan?.autoEnabled);

  // 서버 그룹 순서대로 묶는다. 그룹 목록에 없는 그룹의 기능도 빠뜨리지 않는다
  const groups = [
    ...settings.groups,
    ...Array.from(new Set(settings.features.map((f) => f.group)))
      .filter((key) => !settings.groups.some((g) => g.key === key))
      .map((key) => ({ key, label: key })),
  ]
    .map((group) => ({
      ...group,
      features: settings.features.filter((f) => f.group === group.key),
    }))
    .filter((group) => group.features.length > 0);

  const handleBack = () => {
    if (draft.isDirty && !window.confirm(LEAVE_CONFIRM_MESSAGE)) return;
    router.push(`/admin/exhibition/detail/${encodeURIComponent(expoId)}`);
  };

  const save = () => {
    if (!draft.isDirty || draft.isStale || isPending) return;
    setSaveError(null);
    mutate(draft.toRequest(), {
      onSuccess: (saved) => {
        draft.reset();
        toast.success(savedMessage(saved.applied, labelOf));
      },
      onError: (error) => {
        // 초안은 그대로 둔다. 409면 최신 값을 다시 읽어 서버 값과 내 변경을 나눠 보여 준다
        if (getErrorStatus(error) === 409) refetch();
        setSaveError(error.message);
      },
    });
  };

  const disabled = isPending;

  return (
    <div className="flex w-full max-w-[816px] flex-col gap-24 pb-[40px]">
      <div className="flex items-center gap-12">
        <button
          type="button"
          aria-label="뒤로 가기"
          className="-m-6 flex h-[44px] w-[44px] flex-none items-center justify-center"
          onClick={handleBack}
        >
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-h2b text-black">기능 설정</h1>
      </div>
      <p className="break-keep text-body2r text-gray-500">
        이 박람회에서 쓸 기능을 고릅니다. 끈 기능은 새 신청·사용만 막고, 이미
        받은 신청·기록과 조회·취소는 그대로 둡니다. 바꾼 내용은 저장해야
        적용됩니다.
      </p>

      {draft.isStale && (
        <div
          role="alert"
          className="flex flex-col gap-8 rounded-sm border-1 border-solid border-error px-[16px] py-[12px]"
        >
          <p className="text-body2b text-black">
            편집하는 사이 다른 곳에서 설정이 바뀌었습니다.
          </p>
          {(draft.serverChanges.length > 0 ||
            draft.serverPhoneChange !== undefined) && (
            <p className="break-keep text-body2r text-gray-600">
              서버에서 바뀐 값:{' '}
              {[
                ...draft.serverChanges.map(
                  (c) => `${labelOf(c.key)} ${c.enabled ? '켜짐' : '꺼짐'}`,
                ),
                ...(draft.serverPhoneChange === undefined
                  ? []
                  : [
                      `휴대전화 인증 ${draft.serverPhoneChange ? '켜짐' : '꺼짐'}`,
                    ]),
              ].join(', ')}
            </p>
          )}
          <p className="break-keep text-body2r text-gray-600">
            내 변경:{' '}
            {[
              ...draft.changes.map(
                (c) => `${labelOf(c.key)} ${c.enabled ? '켜기' : '끄기'}`,
              ),
              ...(draft.phoneChanged
                ? [`휴대전화 인증 ${draft.phoneValue ? '켜기' : '끄기'}`]
                : []),
            ].join(', ') || '없음(최신 값과 같아졌습니다)'}
          </p>
          <div className="flex gap-8 mobile:flex-col">
            <Button variant="white" onClick={draft.reset}>
              내 변경 버리기
            </Button>
            <Button onClick={draft.rebase}>최신 값에 내 변경 다시 적용</Button>
          </div>
        </div>
      )}

      <PhoneVerificationRow
        value={draft.phoneValue}
        isPending={draft.phoneChanged}
        disabled={disabled}
        onChange={draft.setPhone}
      />

      {groups.map((group) => (
        <section
          key={group.key}
          aria-labelledby={`feature-group-${group.key}`}
          className="rounded-sm border-1 border-solid border-gray-200 bg-white px-[20px] py-[8px]"
        >
          <h2
            id={`feature-group-${group.key}`}
            className="pt-8 text-body2b text-gray-600"
          >
            {group.label}
          </h2>
          <ul>
            {group.features.map((feature) => (
              <FeatureRow
                key={feature.key}
                feature={feature}
                configured={
                  plan?.configured.has(feature.key) ?? feature.configuredEnabled
                }
                effective={
                  plan?.effective.has(feature.key) ?? feature.effectiveEnabled
                }
                blockedByLabels={(
                  plan?.blockedBy[feature.key] ?? feature.blockedBy
                ).map(labelOf)}
                pending={
                  changedKeys.has(feature.key)
                    ? 'changed'
                    : autoKeys.has(feature.key)
                      ? 'auto'
                      : undefined
                }
                link={links[feature.key]}
                note={FEATURE_NOTES[feature.key]}
                disabled={disabled}
                onToggle={(enabled) => draft.toggle(feature.key, enabled)}
                onRetryReadiness={refetch}
              />
            ))}
          </ul>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-16 flex flex-col gap-8 border-t-1 border-solid border-gray-200 bg-white px-16 py-12">
        <div aria-live="polite" className="flex flex-col gap-4">
          {draft.dropped.length > 0 && (
            <p className="break-keep text-caption1r text-gray-600">
              {draft.dropped
                .map(
                  ({ key, by }) =>
                    `${labelOf(by)} 변경으로 ${labelOf(key)} 변경을 취소했습니다.`,
                )
                .join(' ')}
            </p>
          )}
          {plan && plan.autoEnabled.length > 0 && (
            <p className="break-keep text-caption1r text-gray-600">
              함께 켜짐: {joinLabels(plan.autoEnabled, labelOf)}
            </p>
          )}
          {plan && plan.deactivated.length > 0 && (
            <p className="break-keep text-caption1r text-error">
              켜 둔 채 사용할 수 없게 됨:{' '}
              {joinLabels(plan.deactivated, labelOf)}
            </p>
          )}
          {plan && plan.reactivated.length > 0 && (
            <p className="break-keep text-caption1r text-gray-600">
              다시 사용됨: {joinLabels(plan.reactivated, labelOf)}
            </p>
          )}
          <p className="text-body2b text-black">
            {draft.isDirty
              ? `저장하지 않은 변경 ${draft.changeCount}건`
              : '저장하지 않은 변경 없음'}
            {isRefetching && (
              <span className="ml-8 text-caption1r text-gray-500">
                최신 값 확인 중…
              </span>
            )}
          </p>
        </div>
        {saveError && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="break-keep text-caption1r text-error outline-none"
          >
            {saveError} 바꾼 내용은 그대로 남아 있습니다.
          </div>
        )}
        <div className="flex gap-8">
          <Button
            variant="white"
            disabled={!draft.isDirty || isPending}
            onClick={() => {
              draft.reset();
              setSaveError(null);
            }}
          >
            되돌리기
          </Button>
          <Button
            disabled={!draft.isDirty || draft.isStale || isPending}
            onClick={save}
          >
            {isPending ? '저장 중…' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 박람회 기능 설정 페이지. 서버 카탈로그로 행을 그리고, 초안을 한 번에 저장한다.
 * 조회에 실패하면 기본값이나 "모두 꺼짐" 을 그리지 않고 다시 시도만 보여 준다
 */
const FeatureSettingsManager = () => {
  const { expoId, expo } = useRegistrationExpo();
  const query = useExpoFeatureSettings(expoId);

  return withLoading({
    isLoading: query.isLoading,
    children: (
      <div className="flex w-full flex-col items-center gap-8">
        {expo && (
          <p className="w-full max-w-[816px] truncate text-body2b text-gray-500">
            {expo.title}
          </p>
        )}
        {query.data ? (
          <FeatureSettingsForm
            // 다른 박람회로 옮기면 초안을 새로 시작한다
            key={expoId}
            expoId={expoId}
            settings={query.data}
            isRefetching={query.isRefetching}
            refetch={() => void query.refetch()}
          />
        ) : (
          <QueryError
            message={
              getErrorStatus(query.error) === 404
                ? '박람회를 찾을 수 없습니다.'
                : (query.error?.message ?? '기능 설정을 불러오지 못했습니다.')
            }
            onRetry={() => void query.refetch()}
          />
        )}
      </div>
    ),
  });
};

export default FeatureSettingsManager;
