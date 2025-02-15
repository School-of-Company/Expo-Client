import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const formCreateRouter = ({
  id,
  type,
  mode,
  router,
}: {
  id: string;
  type: 'STANDARD' | 'TRAINEE';
  mode: 'application' | 'survey';
  router: AppRouterInstance;
}) => {
  let nextType: 'STANDARD' | 'TRAINEE' | null = null;
  let nextMode: 'application' | 'survey' | null = null;

  if (type === 'STANDARD' && mode === 'application') {
    nextType = 'TRAINEE';
    nextMode = 'application';
  } else if (type === 'TRAINEE' && mode === 'application') {
    nextType = 'STANDARD';
    nextMode = 'survey';
  } else if (type === 'STANDARD' && mode === 'survey') {
    nextType = 'TRAINEE';
    nextMode = 'survey';
  } else if (type === 'TRAINEE' && mode === 'survey') {
    router.push('/');
    return;
  }

  if (nextType && nextMode) {
    router.push(`/form/create/${id}?type=${nextType}&mode=${nextMode}`);
  }
};
