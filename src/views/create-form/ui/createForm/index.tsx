import CheckBoxOption from '@/entities/create-form/ui/CheckBoxOption';
import DeleteButton from '@/entities/create-form/ui/DeleteButton';
import DropDownOption from '@/entities/create-form/ui/DropDownOption';
import FormTitle from '@/entities/create-form/ui/FormTitle';
import FormTypeSelect from '@/entities/create-form/ui/FormTypeSelect';
import MultipleChoicOption from '@/entities/create-form/ui/MultipleChoicOption';
import PictureOption from '@/entities/create-form/ui/PictureOption';
import RequiredToggle from '@/entities/create-form/ui/RequiredToggle';
import TextOption from '@/entities/create-form/ui/TextOption';
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
        <TextOption />
        <CheckBoxOption />
        <DropDownOption />
        <MultipleChoicOption />
        <PictureOption />
      </div>
    </div>
  );
};

export default CreateForm;
