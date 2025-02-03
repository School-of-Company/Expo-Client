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
    <Plus fill="#448FFF" />
    <div className="text-body3 text-main-600">추가하기</div>
  </button>
);

export default AddItemButton;
