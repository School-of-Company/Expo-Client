'use client';

import { RegistrationSelect, ScheduleProgram } from '../../../common';
import { getProgramGroups, toProgramKey } from '../../model/programFormLink';

interface ProgramGroupPickerProps {
  programs: ScheduleProgram[];
  /** 고치는 회차. 묶음 이름에서 뺀다 */
  programKey?: string;
  value: string;
  onChange: (groupId: string) => void;
}

const NEW_GROUP = '__new__';

/**
 * 회차를 프로그램 묶음에 넣는다. 묶음은 회차의 groupId 로만 존재하므로
 * 새 묶음은 ID 를 만들어 두고 회차를 저장할 때 생긴다
 */
const ProgramGroupPicker = ({
  programs,
  programKey,
  value,
  onChange,
}: ProgramGroupPickerProps) => {
  const groups = getProgramGroups(programs);
  const isNewGroup =
    Boolean(value) && !groups.some(({ groupId }) => groupId === value);

  const options = [
    { value: '', label: '묶음 없음' },
    ...groups.map(({ groupId, programs: members }) => {
      const others = members.filter(
        (program) => toProgramKey(program) !== programKey,
      );
      return {
        value: groupId,
        label:
          others.length > 0
            ? `${others.map(({ title }) => title).join(', ')} 묶음`
            : '이 회차만 있는 묶음',
      };
    }),
    ...(isNewGroup
      ? [{ value, label: '새 묶음 (저장하면 만들어집니다)' }]
      : []),
    { value: NEW_GROUP, label: '+ 새 묶음 만들기' },
  ];

  return (
    <RegistrationSelect
      ariaLabel="프로그램 묶음"
      value={value}
      options={options}
      onChange={(next) =>
        onChange(next === NEW_GROUP ? crypto.randomUUID() : next)
      }
    />
  );
};

export default ProgramGroupPicker;
