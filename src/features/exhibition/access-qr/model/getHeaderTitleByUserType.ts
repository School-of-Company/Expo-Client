import { ApplicationType } from '@/shared/types/exhibition/type';

export const getHeaderTitleByUserType = (
  userType: string | null,
  applicationType: ApplicationType,
): string => {
  const prefix = applicationType === 'REGISTER' ? '사전' : '현장';

  switch (userType) {
    case 'STANDARD':
      return `${prefix} 참가자`;
    case 'TRAINEE':
      return `${prefix} 연수자`;
    default:
      return '유효하지 않은 유저 타입';
  }
};
