export const getSuccessMessage = (
  userType: string | null,
  formType: string | null,
): string => {
  if (userType === 'STANDARD') {
    if (formType === 'application')
      return '참가자 박람회 신청이 완료되었습니다.';
    if (formType === 'survey')
      return '참가자 만족도 조사 제출이 완료되었습니다.';
    return '참가자 신청이 완료되었습니다.';
  }

  if (userType === 'TRAINEE') {
    if (formType === 'application')
      return '연수자 박람회 신청이 완료되었습니다.';
    if (formType === 'survey')
      return '연수자 만족도 조사 제출이 완료되었습니다.';
    return '연수자 신청이 완료되었습니다.';
  }

  return '신청이 완료되었습니다';
};
