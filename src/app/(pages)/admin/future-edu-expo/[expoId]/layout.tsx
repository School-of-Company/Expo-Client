import { notFound } from 'next/navigation';
import { isValidExpoId } from '@/shared/config';
import { RegistrationExpoGuard } from '@/widgets/registration';

// 하위 화면이 expoId 를 API·이동 경로에 쓰므로 형식이 다르면 들어오지 못하게 한다
const Layout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { expoId: string };
}) => {
  if (!isValidExpoId(params.expoId)) notFound();
  return <RegistrationExpoGuard>{children}</RegistrationExpoGuard>;
};

export default Layout;
