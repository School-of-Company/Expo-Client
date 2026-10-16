'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { ReactNode, useMemo } from 'react';
import { ProgramNavigation } from '@/entities/program';
import { withLoading } from '@/shared/hocs';
import { Button } from '@/shared/ui';
import { TableForm } from '@/shared/ui/Table';
import { standardCategories, trainingCategories } from '../../model/category';
import { useProgramQueries } from '../../model/useProgramData';

type ProgramType = 'STANDARD' | 'TRAINING';

interface ProgramListTableProps {
  expoId: string;
  /** 넘기면 프로그램 추가·수정·삭제 버튼을 보인다 */
  onAdd?: () => void;
  onEdit?: (programType: ProgramType, programId: number) => void;
  onRemove?: (programType: ProgramType, programId: number) => void;
  /** 표 위에 여는 추가·수정 양식 */
  editor?: ReactNode;
  /** 프로그램 추가 버튼 옆에 둘 버튼 */
  toolbar?: ReactNode;
}

const ProgramListTable = ({
  expoId,
  onAdd,
  onEdit,
  onRemove,
  editor,
  toolbar,
}: ProgramListTableProps) => {
  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation') || 'standard';

  const router = useRouter();

  const { programQueries, isLoading } = useProgramQueries(expoId, navigation);

  const requestPrintCategories = useMemo(() => {
    return navigation === 'training' ? trainingCategories : standardCategories;
  }, [navigation]);

  // 서버는 'YYYY-MM-DDTHH:mm' 로 준다. 표에는 'T' 없이 날짜와 시각을 띄워 보여 준다
  const programData = useMemo(
    () =>
      (programQueries.data || []).map((program) => ({
        ...program,
        startedAt: program.startedAt.slice(0, 16).replace('T', ' '),
        endedAt: program.endedAt.slice(0, 16).replace('T', ' '),
      })),
    [programQueries.data],
  );

  const programType: ProgramType =
    navigation === 'training' ? 'TRAINING' : 'STANDARD';

  const routeActions = {
    RouteActions: (programId: number) => {
      router.push(
        `/program/${expoId}/detail/${programId}?navigation=${navigation}`,
      );
    },
    ...(onEdit && {
      EditActions: (programId: number) => onEdit(programType, programId),
    }),
    ...(onRemove && {
      RemoveActions: (programId: number) => onRemove(programType, programId),
    }),
  };

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-46 overflow-y-auto">
        <ProgramNavigation />
        <div className="flex items-center justify-between gap-16 mobile:flex-col mobile:items-stretch">
          <p className="text-body2r text-gray-500 mobile:text-caption1r">
            행을 고른 뒤 아래에서 수정·삭제하거나, 이동을 눌러 출석을
            확인합니다.
          </p>
          <div className="flex flex-wrap justify-end gap-8">
            {toolbar}
            {onAdd && (
              <Button size="small" onClick={onAdd}>
                프로그램 추가
              </Button>
            )}
          </div>
        </div>
        {editor}
        <TableForm
          categories={requestPrintCategories}
          data={programData}
          maxHeight="414px"
          footerType="route"
          text="프로그램 수"
          actions={routeActions}
        />
      </div>
    ),
  });
};

export default ProgramListTable;
