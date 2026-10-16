'use client';

import { useRegistrationExpo } from '../../../common';
import ApplicationLedger from '../ApplicationLedger';

const RegistrationLedger = () => {
  const { expoId } = useRegistrationExpo();

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col gap-24">
      {/* key: 행사 전환 시 선택·필터·모달 상태 초기화 */}
      <ApplicationLedger key={expoId} />
    </div>
  );
};

export default RegistrationLedger;
