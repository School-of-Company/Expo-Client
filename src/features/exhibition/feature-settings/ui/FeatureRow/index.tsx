'use client';

import Link from 'next/link';
import { ToggleButton } from '@/shared/ui';
import {
  ExpoFeature,
  FeatureReadinessStatus,
  ProgramRecruitmentPhase,
} from '../../api/expoFeatures';
import { FeatureLink } from '../../model/featureLinks';

const READINESS_LABEL: Record<FeatureReadinessStatus, string> = {
  READY: '준비됨',
  NEEDS_SETUP: '설정 필요',
  UNAVAILABLE: '지금 확인할 수 없음',
  UNKNOWN: '확인하지 못함',
};

const READINESS_CLASS: Record<FeatureReadinessStatus, string> = {
  READY: 'border-main-600 text-main-600',
  NEEDS_SETUP: 'border-error text-error',
  UNAVAILABLE: 'border-gray-400 text-gray-500',
  UNKNOWN: 'border-gray-400 text-gray-500',
};

const RECRUITMENT_LABEL: Record<ProgramRecruitmentPhase, string> = {
  NO_POLICY: '모집 정책 없음',
  UPCOMING: '모집 전',
  OPEN: '모집 중',
  ENDED: '모집 종료',
  CLOSED: '마감',
};

interface FeatureRowProps {
  feature: ExpoFeature;
  /** 초안을 반영한 선택값·실효 값 */
  configured: boolean;
  effective: boolean;
  /** 실효 OFF로 만든 선행 기능 이름 */
  blockedByLabels: string[];
  /** 저장하지 않은 변경: 직접 바꿈, 선행 기능이라 함께 켜짐 */
  pending?: 'changed' | 'auto';
  link?: FeatureLink;
  note?: string;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onRetryReadiness: () => void;
}

/** 기능 한 줄. 이름·설명은 서버 카탈로그 값을 그대로 쓴다 */
const FeatureRow = ({
  feature,
  configured,
  effective,
  blockedByLabels,
  pending,
  link,
  note,
  disabled,
  onToggle,
  onRetryReadiness,
}: FeatureRowProps) => {
  const statusId = `feature-${feature.key}-status`;
  const { readiness, programReadiness } = feature;
  const notReadySessions =
    programReadiness?.sessions.filter((s) => s.status !== 'READY') ?? [];

  const status = effective
    ? '사용 중'
    : configured
      ? `켜 두었지만 ${blockedByLabels.join('·')}이(가) 꺼져 있어 사용할 수 없습니다. 선행 기능을 켜면 다시 사용됩니다.`
      : '꺼짐';

  return (
    <li className="flex flex-col gap-12 border-b-1 border-solid border-gray-100 py-16 last:border-b-0">
      <div className="flex items-start justify-between gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-8">
            <h3 className="text-body1b text-black">{feature.label}</h3>
            {pending && (
              <span className="rounded-sm border-1 border-solid border-gray-300 px-8 py-2 text-caption1r text-gray-700">
                {pending === 'auto' ? '함께 켜짐 · 저장 전' : '저장 전'}
              </span>
            )}
          </div>
          {feature.description && (
            <p className="break-keep text-caption1r text-gray-500">
              {feature.description}
            </p>
          )}
          <p
            id={statusId}
            className={`break-keep text-caption1r ${
              configured && !effective ? 'text-error' : 'text-gray-600'
            }`}
          >
            {status}
          </p>
        </div>
        <ToggleButton
          label={feature.label}
          value={configured}
          disabled={disabled}
          describedBy={statusId}
          onChange={onToggle}
        />
      </div>

      <div className="flex flex-col gap-6 rounded-sm bg-gray-100 px-12 py-10">
        <div className="flex flex-wrap items-center gap-8">
          <span className="text-caption1r text-gray-500">
            준비 상태(저장된 설정 기준)
          </span>
          <span
            className={`rounded-sm border-1 border-solid px-8 py-2 text-caption1b ${READINESS_CLASS[readiness.status]}`}
          >
            {READINESS_LABEL[readiness.status]}
          </span>
          {programReadiness && (
            <span className="text-caption1r text-gray-600">
              준비된 회차 {programReadiness.readySessions}/
              {programReadiness.totalSessions}
            </span>
          )}
          {readiness.status === 'UNKNOWN' && (
            <button
              type="button"
              className="text-caption1r text-main-600 underline"
              onClick={onRetryReadiness}
            >
              다시 확인
            </button>
          )}
        </div>
        {readiness.reasons.length > 0 && (
          <ul className="list-disc pl-16 text-caption1r text-gray-600">
            {readiness.reasons.map((reason) => (
              <li key={reason.code} className="break-keep">
                {reason.message}
              </li>
            ))}
          </ul>
        )}
        {notReadySessions.length > 0 && (
          <details className="text-caption1r text-gray-600">
            <summary className="cursor-pointer">
              준비되지 않은 회차 {notReadySessions.length}개 보기
            </summary>
            <ul className="mt-6 flex flex-col gap-4 pl-16">
              {notReadySessions.map((session) => (
                <li key={session.programId} className="break-keep">
                  {session.title} · {READINESS_LABEL[session.status]} ·{' '}
                  {RECRUITMENT_LABEL[session.recruitment]}
                  {session.reasons.length > 0 &&
                    ` — ${session.reasons.map((r) => r.message).join(', ')}`}
                </li>
              ))}
            </ul>
          </details>
        )}
        {note && (
          <p className="break-keep text-caption1r text-gray-500">{note}</p>
        )}
        {link && (
          <Link
            href={link.href}
            className="w-fit text-caption1b text-main-600 underline"
          >
            {link.label} 바로가기
          </Link>
        )}
      </div>
    </li>
  );
};

export default FeatureRow;
