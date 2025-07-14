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
        ? '제2회 Dev Fest 사전등록'
        : '제2회 Dev Fest 현장등록';
    }
    if (userType === 'TRAINEE') {
      return applicationType === 'register'
        ? '사전 연수자 박람회 등록'
        : '현장 연수자 박람회 등록';
    }
  }

  if (formType === 'survey') {
    if (userType === 'STANDARD') return '제2회 Dev Fest 만족도 조사 등록';
    if (userType === 'TRAINEE') return '연수자 만족도 조사 제출';
  }

  return '';
};
