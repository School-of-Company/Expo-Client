export type FormType = 'application' | 'survey';
export type UserType = 'STANDARD' | 'TRAINEE';
export type ApplicationType = 'register' | 'onsite';

export const getHeaderTitle = (
  formType: FormType,
  userType: UserType,
  applicationType?: ApplicationType,
): string => {
  if (formType === 'application') {
    if (userType === 'STANDARD') {
      return applicationType === 'register'
        ? '사전 참가자 박람회 신청'
        : '현장 참가자 박람회 신청';
    }
    if (userType === 'TRAINEE') {
      return applicationType === 'register'
        ? '사전 연수자 박람회 신청'
        : '현장 연수자 박람회 신청';
    }
  }

  if (formType === 'survey') {
    if (userType === 'STANDARD') return '참가자 만족도 조사 신청';
    if (userType === 'TRAINEE') return '연수자 만족도 조사 신청';
  }

  return '';
};
