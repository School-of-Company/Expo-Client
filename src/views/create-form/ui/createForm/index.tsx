import FormContainer from '@/widgets/create-form/ui/FormContainer';
import { Header } from '@/widgets/layout';
import { selectOptionData } from '../../model/selectOptionData';

const CreateForm = () => {
  const options = selectOptionData;
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[792px] flex-1 px-5">
        <FormContainer options={options} />
      </div>
    </div>
  );
};

export default CreateForm;
