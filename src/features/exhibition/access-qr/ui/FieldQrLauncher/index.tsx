'use client';

import { useRouter } from 'next/navigation';
import { getExpoRoutes } from '@/shared/config';
import { Button, Section } from '@/shared/ui';

const TARGETS = [
  { label: '참가자 사전 등록', userType: 'STANDARD', applicationType: 'PRE' },
  { label: '참가자 현장 등록', userType: 'STANDARD', applicationType: 'FIELD' },
  { label: '연수자', userType: 'TRAINEE', applicationType: 'PRE' },
] as const;

/** 현장 신청용 QR 을 띄울 대상을 고른다. 고르면 QR 만 크게 보이는 화면으로 간다 */
const FieldQrLauncher = ({ expoId }: { expoId: string }) => {
  const router = useRouter();
  const routes = getExpoRoutes(expoId);

  return (
    <Section
      title="현장 등록 QR 띄우기"
      description="방문객이 휴대폰으로 찍어 바로 신청하는 QR입니다. 대상을 고르면 QR만 크게 보이는 화면으로 바뀝니다."
    >
      <div className="grid grid-cols-3 gap-12 mobile:grid-cols-1">
        {TARGETS.map(({ label, userType, applicationType }) => (
          <Button
            key={label}
            variant="white"
            onClick={() =>
              router.push(routes.accessQr(userType, applicationType))
            }
          >
            {label}
          </Button>
        ))}
      </div>
    </Section>
  );
};

export default FieldQrLauncher;
