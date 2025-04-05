import { Plus } from '@/shared/assets/icons';

interface AddItemButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const AddItemButton = ({ onClick }: AddItemButtonProps) => (
  <button
    type="button"
    className="mx-auto flex items-center gap-5"
    onClick={onClick}
  >
    <div className="flex gap-8">
      <Plus fill="#A2C7FF" />
      <div className="text-body3 text-main-400">추가하기</div>
    </div>
  </button>
);

export default AddItemButton;
