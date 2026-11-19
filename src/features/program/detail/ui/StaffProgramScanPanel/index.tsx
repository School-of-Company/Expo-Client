'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getPublicStandardProgram } from '@/shared/api/getStandardProgram';
import { getTrainingProgram } from '@/shared/api/getTrainingProgram';
import { Program } from '@/shared/types/program/list/type';
import {
  ProgramScanType,
  useProgramAttendanceScan,
} from '../../model/useProgramAttendanceScan';
import ProgramScanPanel from '../ProgramScanPanel';
import ProgramScanResultCard from '../ProgramScanResultCard';

const TYPE_LABEL: Record<ProgramScanType, string> = {
  standard: '일반 프로그램',
  training: '연수 프로그램',
};

// '2025-05-01T10:00:00' → '05.01 10:00'
const toShortTime = (value: string) =>
  value.length >= 16
    ? `${value.slice(5, 7)}.${value.slice(8, 10)} ${value.slice(11, 16)}`
    : value;

const ProgramAttendance = ({
  expoId,
  programId,
  type,
}: {
  expoId: string;
  programId: string;
  type: ProgramScanType;
}) => {
  const { submitScan, lastResult, isProcessing } = useProgramAttendanceScan({
    expoId,
    programId,
    type,
  });
  return (
    <div className="flex flex-col gap-16">
      <ProgramScanResultCard result={lastResult} isProcessing={isProcessing} />
      <ProgramScanPanel onScan={submitScan} />
    </div>
  );
};

/**
 * 스태프 링크 화면의 프로그램 출석. 스태프 토큰은 프로그램 목록(관리자 조회)을 못 읽어서
 * 참가자 신청 화면이 쓰는 공개 목록으로 회차를 고른다
 */
const StaffProgramScanPanel = ({ expoId }: { expoId: string }) => {
  const [type, setType] = useState<ProgramScanType>('standard');
  const [programId, setProgramId] = useState('');
  const programs = useQuery<Program[], Error>({
    queryKey: ['staffPrograms', expoId, type],
    queryFn: () =>
      type === 'standard'
        ? getPublicStandardProgram(expoId)
        : getTrainingProgram(expoId),
  });
  const sorted = [...(programs.data ?? [])].sort((a, b) =>
    a.startedAt.localeCompare(b.startedAt),
  );

  return (
    <div className="flex flex-col gap-16">
      <div
        role="group"
        aria-label="프로그램 종류"
        className="grid grid-cols-2 gap-8"
      >
        {(['standard', 'training'] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={type === value}
            onClick={() => {
              setType(value);
              setProgramId('');
            }}
            className={`rounded-sm border-1 border-solid px-12 py-10 text-body2b ${
              type === value
                ? 'border-main-600 bg-main-600 text-white'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            {TYPE_LABEL[value]}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-8">
        <span className="text-caption1r text-gray-600">출석을 받을 회차</span>
        <select
          value={programId}
          onChange={(event) => setProgramId(event.target.value)}
          disabled={programs.isLoading || programs.isError}
          className="rounded-sm border-1 border-solid border-gray-200 px-12 py-10 text-body2r text-black"
        >
          <option value="">
            {programs.isLoading ? '불러오는 중...' : '회차를 고르세요'}
          </option>
          {sorted.map((program) => (
            <option key={program.id} value={String(program.id)}>
              {toShortTime(program.startedAt)} {program.title}
            </option>
          ))}
        </select>
      </label>
      {programs.isError && (
        <div role="alert" className="flex items-center justify-between gap-12">
          <p className="break-keep text-body2r text-gray-500">
            {programs.error.message}
          </p>
          <button
            type="button"
            onClick={() => programs.refetch()}
            className="shrink-0 text-body2r text-main-600 underline"
          >
            다시 시도
          </button>
        </div>
      )}
      {programs.isSuccess && sorted.length === 0 && (
        <p className="text-body2r text-gray-500">
          {TYPE_LABEL[type]} 회차가 없습니다.
        </p>
      )}
      {programId ? (
        <ProgramAttendance
          key={`${type}-${programId}`}
          expoId={expoId}
          programId={programId}
          type={type}
        />
      ) : (
        <p className="rounded-sm bg-gray-100 px-16 py-24 text-center text-body2r text-gray-500">
          회차를 고르면 QR 스캔을 시작합니다.
        </p>
      )}
    </div>
  );
};

export default StaffProgramScanPanel;
