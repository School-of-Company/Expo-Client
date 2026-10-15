'use client';

import { useCreateProgramForm } from '../../model/useProgramForm';
import ProgramFormEditor, {
  ProgramFormBuilderSlotProps,
} from '../ProgramFormEditor';

interface Props {
  expoId: string;
  renderBuilder?: (props: ProgramFormBuilderSlotProps) => React.ReactNode;
}

const ProgramFormCreate = ({ expoId, renderBuilder }: Props) => {
  const { create, isPending } = useCreateProgramForm(expoId);

  return (
    <ProgramFormEditor
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
