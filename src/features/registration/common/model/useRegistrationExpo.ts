import { useParams } from 'next/navigation';
import { getRegistrationRoutes } from '@/shared/config';
import { useExpoDetail } from '@/shared/queries';

/** 경로의 [expoId]로 관리 중인 박람회와 하위 경로를 가져온다 */
export const useRegistrationExpo = () => {
  const { expoId } = useParams<{ expoId: string }>();
  const {
    data: expo,
    isLoading: isExpoLoading,
    error: expoError,
    refetch: refetchExpo,
  } = useExpoDetail(expoId);

  return {
    expoId,
    expo,
    isExpoLoading,
    expoError,
    refetchExpo,
    routes: getRegistrationRoutes(expoId),
  };
};
