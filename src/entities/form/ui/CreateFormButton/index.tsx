import { Plus } from '@/shared/assets/icons';
import { COLORS } from '@/shared/config';

interface Props {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  text?: string;
}

const CreateFormButton = ({ onClick, text = '추가하기' }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-fit items-center gap-12 rounded-sm bg-main-100 px-16 py-12"
    >
      <Plus fill={COLORS.main600} />
      <p className="text-body2r text-main-600">{text}</p>
    </button>
  );
};

export default CreateFormButton;
