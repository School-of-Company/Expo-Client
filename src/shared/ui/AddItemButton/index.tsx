import { Plus } from '@/shared/assets/icons';
import { COLORS } from '@/shared/config';

interface AddItemButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const AddItemButton = ({ onClick }: AddItemButtonProps) => (
  <button
    type="button"
    className="mx-auto flex items-center gap-5 py-20"
    onClick={onClick}
  >
    <div className="flex gap-8">
      <Plus fill={COLORS.main600} />
      <div className="text-body3 text-main-600">추가하기</div>
    </div>
  </button>
);

export default AddItemButton;
