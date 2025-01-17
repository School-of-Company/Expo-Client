import { Plus } from '@/shared/assets/icons';

interface AddButtonProps {
  onClick: () => void;
}

const AddButton = ({ onClick }: AddButtonProps) => (
  <button
    type="button"
    className="mx-auto flex items-center gap-5"
    onClick={onClick}
  >
    <Plus fill="#448FFF" />
    <div className="text-body3 text-main-600">추가하기</div>
  </button>
);

export default AddButton;
