'use client';

import { useState } from 'react';
import { useProgramFormQuery } from '@/entities/form';
import { Loading } from '@/shared/ui';
import { toProgramFormValues } from '../../model/programFormValues';
import { useEditProgramForm } from '../../model/useProgramForm';
import ProgramFormEditor, {
  ProgramFormBuilderSlotProps,
} from '../ProgramFormEditor';
import VersionConflictModal from '../VersionConflictModal';
import type { ProgramFormResponseDto } from '@/entities/form';

interface Props {
  formId: string;
  renderBuilder?: (props: ProgramFormBuilderSlotProps) => React.ReactNode;
}

const ProgramFormEdit = ({ formId, renderBuilder }: Props) => {
  const { data, isError } = useProgramFormQuery(formId);

  if (isError) {
    // 이유는 전역 쿼리 오류 토스트가 안내한다
    return (
      <p className="text-body2r text-gray-500">폼을 불러오지 못했습니다.</p>
    );
  }
  if (!data) return <Loading />;

  // 처음 받은 폼으로 편집을 시작한다. 이후 캐시가 다시 받아져도 편집 기준(version)은 바뀌지 않는다
  return <ProgramFormEditBody initial={data} renderBuilder={renderBuilder} />;
};

const ProgramFormEditBody = ({
  initial,
  renderBuilder,
}: Omit<Props, 'formId'> & { initial: ProgramFormResponseDto }) => {
  const { base, save, isPending, hasConflict, reapply, reloadLatest } =
    useEditProgramForm(initial);
  // 편집기는 처음 값으로만 채워지므로, 최신본을 불러오면 key 를 바꿔 다시 그린다
  const [editorKey, setEditorKey] = useState(0);
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await reloadLatest();
      setEditorKey((key) => key + 1);
    } catch {
      // 실패 이유는 전역 쿼리 오류 토스트가 안내하고, 모달은 남겨 다시 고르게 한다
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <>
      {/* 서버가 연결 회차 보호 전까지 거절하는 동작이라 화면에서 막고 안내한다(Expo-Expo-Server#76) */}
      <p className="text-caption1r text-gray-500">
        응답 기간 줄이기와 폼 삭제는 지원하지 않습니다. 응답 기간은 늘리기만 할
        수 있습니다.
      </p>
      <ProgramFormEditor
        key={editorKey}
        defaultValues={toProgramFormValues(base)}
        baseForm={base}
        submitLabel="저장"
        isPending={isPending}
        renderBuilder={renderBuilder}
        onSubmit={save}
      />
      {hasConflict && (
        <VersionConflictModal
          isPending={isPending || isReloading}
          onReload={handleReload}
          onReapply={reapply}
        />
      )}
    </>
  );
};

export default ProgramFormEdit;
