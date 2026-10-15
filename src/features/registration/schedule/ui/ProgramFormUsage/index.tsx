'use client';

import { useRegistrationExpo, useSchedulePrograms } from '../../../common';
import { getProgramsUsingForm } from '../../model/programFormLink';

/** 폼 편집 화면 위에 이 폼을 쓰는 회차를 알려 준다. 공유 폼을 고치면 모든 연결 회차에 적용된다 */
const ProgramFormUsage = ({ formId }: { formId: string }) => {
  const { expoId } = useRegistrationExpo();
  const { data: programs } = useSchedulePrograms(expoId);
  if (!programs) return null;

  const linked = getProgramsUsingForm(programs, formId);
  return (
    <div className="space-y-6 rounded-sm border-1 border-solid border-gray-200 px-20 py-16">
      <p className="text-body2b text-black">
        연결 회차 {linked.length > 0 ? `${linked.length}개` : '없음'}
      </p>
      <p className="text-caption1r text-gray-500">
        {linked.length > 0
          ? `${linked.map(({ title }) => title).join(', ')}. 질문·응답 기간을 고치면 이 회차들에 모두 적용됩니다. 질문이나 대상이 다른 회차는 폼을 따로 만들어 주세요.`
          : '일정·모집의 회차 수정에서 이 폼을 선택하면 연결됩니다.'}
      </p>
    </div>
  );
};

export default ProgramFormUsage;
