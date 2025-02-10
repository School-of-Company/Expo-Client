import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const formCreateRouter = ({
  id,
  navigation,
  router,
}: {
  id: string;
  navigation: string | null;
  router: AppRouterInstance;
}) => {
  switch (navigation) {
    case 'STANDARD':
      router.push(`/form/create/${id}?navigation=TRAINEE`);
      break;
    case 'TRAINEE':
      router.push('/');
      break;
    default:
      break;
  }
};
