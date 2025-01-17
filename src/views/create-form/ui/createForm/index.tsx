import DeleteButton from '@/entities/create-form/ui/DeleteButton';
import FormTitle from '@/entities/create-form/ui/FormTitle';
import FormTypeSelect from '@/entities/create-form/ui/FormTypeSelect';
import RequiredToggle from '@/entities/create-form/ui/RequiredToggle';

import { Header } from '@/widgets/layout';
import { selectOptionData } from '../../model/selectOptionData';

const CreateForm = () => {
  const options = selectOptionData;
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[792px] flex-1 px-5">
        <FormTitle />
        <DeleteButton />
        <RequiredToggle />
        <FormTypeSelect options={options} />
      </div>
    </div>
  );
};

export default CreateForm;
