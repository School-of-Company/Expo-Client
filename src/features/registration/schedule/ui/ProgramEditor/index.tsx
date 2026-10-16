'use client';

import { useEffect, useRef } from 'react';
import { toProgramKey } from '../../model/programFormLink';
import { useProgramEditor } from '../../model/useProgramEditor';
import ProgramForm from '../ProgramForm';

interface ProgramEditorProps {
  expoId: string;
  editor: ReturnType<typeof useProgramEditor>;
}

/** 프로그램 목록 위에 여는 추가·수정 양식. 열리면 양식으로 스크롤한다 */
const ProgramEditor = ({ expoId, editor }: ProgramEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { editing, programs, draftForm, close } = editor;

  useEffect(() => {
    if (editing)
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [editing]);

  if (!editing) return null;

  return (
    <div ref={ref} className="w-full scroll-mt-[96px]">
      <ProgramForm
        key={editing === 'new' ? 'new' : toProgramKey(editing)}
        expoId={expoId}
        program={editing === 'new' ? undefined : editing}
        programs={programs}
        initialForm={draftForm}
        onClose={close}
      />
    </div>
  );
};

export default ProgramEditor;
