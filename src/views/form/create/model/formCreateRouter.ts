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
    case 'standard_application':
      router.push(`/form/create/${id}?navigation=trainee_application`);
      break;
    case 'trainee_application':
      router.push(`/form/create/${id}?navigation=standard_survey`);
      break;
    case 'standard_survey':
      router.push(`/form/create/${id}?navigation=trainee_survey`);
      break;
    case 'trainee_survey':
      router.push('/');
      break;
    default:
      break;
  }
};
