'use client';

import {
  EMPTY_PROGRAM_FORM_VALUES,
  ProgramFormValues,
} from '../../model/programFormValues';
import { useCreateProgramForm } from '../../model/useProgramForm';
import ProgramFormEditor, {
  ProgramFormBuilderSlotProps,
} from '../ProgramFormEditor';

interface Props {
  expoId: string;
  /** 회차에서 넘어올 때 대상·응답 기간을 회차에 맞춰 채운다 */
  defaultValues?: Partial<ProgramFormValues>;
  /** 없으면 만든 폼의 편집 화면으로 간다 */
  onCreated?: (formId: string) => void;
  renderBuilder?: (props: ProgramFormBuilderSlotProps) => React.ReactNode;
}

const ProgramFormCreate = ({
  expoId,
  defaultValues,
  onCreated,
  renderBuilder,
}: Props) => {
  const { create, isPending } = useCreateProgramForm(expoId, onCreated);

  return (
    <ProgramFormEditor
      defaultValues={{ ...EMPTY_PROGRAM_FORM_VALUES, ...defaultValues }}
      submitLabel="폼 만들기"
      isPending={isPending}
      renderBuilder={renderBuilder}
      onSubmit={async (body) => {
        await create(body);
      }}
    />
  );
};

export default ProgramFormCreate;
