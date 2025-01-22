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
    case 'standard':
      router.push(`/create-form/${id}?navigation=training`);
      break;
    case 'training':
      router.push(`/create-form/${id}?navigation=survey`);
      break;
    case 'survey':
      router.push('/');
      break;
    default:
      break;
  }
};
