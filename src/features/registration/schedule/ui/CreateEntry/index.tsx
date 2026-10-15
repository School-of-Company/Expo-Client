import { Button } from '@/shared/ui';
import ScheduleSection from '../ScheduleSection';

interface CreateEntryProps {
  title: string;
  description: string;
  buttonLabel: string;
  disabled?: boolean;
  onClick: () => void;
}

/** 왼쪽 메뉴에서 오른쪽 표의 등록 양식을 여는 진입점 */
const CreateEntry = ({
  title,
  description,
  buttonLabel,
  disabled,
  onClick,
}: CreateEntryProps) => (
  <ScheduleSection variant="aside" title={title} description={description}>
    <Button variant="white" disabled={disabled} onClick={onClick}>
      {buttonLabel}
    </Button>
  </ScheduleSection>
);

export default CreateEntry;
