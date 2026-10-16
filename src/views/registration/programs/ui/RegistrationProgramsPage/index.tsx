'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ProgramNavigation } from '@/entities/program';
import { ProgramListTable } from '@/features/program/list';
import {
  BulkPolicySection,
  ProgramEditor,
  ScheduleManager,
  useProgramEditor,
} from '@/features/registration/schedule';
import { Button } from '@/shared/ui';
import { PageShell } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

/**
 * 프로그램 페이지. 일반·연수 프로그램 목록을 기준으로 추가·수정·삭제, 모집 기간 일괄 설정, 출석 확인을 한다.
 * 신청 폼은 추가·수정 양식에서 고르거나 새로 만든다. 사전등록 회차는 같은 화면의 세 번째 탭이다
 */
const RegistrationProgramsPage = () => {
  const { expoId } = useParams<{ expoId: string }>();
  const navigation = useSearchParams().get('navigation') || 'standard';
  const editor = useProgramEditor(expoId);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const withProgram =
    (action: (program: NonNullable<ReturnType<typeof editor.find>>) => void) =>
    (programType: 'STANDARD' | 'TRAINING', programId: number) => {
      const program = editor.find(programType, programId);
      if (program) action(program);
    };

  return (
    <PageShell subHeader={<RegistrationTabs />}>
      {navigation === 'preregister' ? (
        <div className="flex w-full flex-col items-center gap-46">
          <ProgramNavigation />
          <ScheduleManager sessionsOnly />
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-24">
          {editor.pendingCount > 0 && (
            <div className="flex w-full max-w-[1200px] items-center justify-between gap-16 rounded-sm bg-main-100 px-20 py-12 mobile:flex-col mobile:items-stretch">
              <p className="text-body2r text-gray-700">
                처리가 멈춘 프로그램 변경이 {editor.pendingCount}건 있습니다.
                다시 처리해야 신청이 열립니다.
              </p>
              <Button
                size="small"
                onClick={editor.retry}
                disabled={editor.isRetrying}
              >
                {editor.isRetrying ? '처리 중...' : '다시 처리'}
              </Button>
            </div>
          )}
          <ProgramListTable
            expoId={expoId}
            onAdd={() => editor.open('new')}
            onEdit={withProgram(editor.open)}
            onRemove={withProgram(editor.remove)}
            toolbar={
              <Button
                size="small"
                variant="white"
                aria-expanded={isBulkOpen}
                onClick={() => setIsBulkOpen((prev) => !prev)}
              >
                {isBulkOpen ? '일괄 설정 닫기' : '모집 기간 일괄 설정'}
              </Button>
            }
            editor={
              <>
                {isBulkOpen && (
                  <BulkPolicySection
                    expoId={expoId}
                    programs={editor.programs}
                    disabled={false}
                  />
                )}
                <ProgramEditor expoId={expoId} editor={editor} />
              </>
            }
          />
        </div>
      )}
    </PageShell>
  );
};

export default RegistrationProgramsPage;
