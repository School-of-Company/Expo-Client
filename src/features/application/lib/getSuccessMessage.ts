export const getSuccessMessage = (
  userType: string | null,
  formType: string | null,
): string => {
  if (userType === 'STANDARD') {
    if (formType === 'application')
      return '제2회 Dev Fest 등록이 완료되었습니다.';
    if (formType === 'survey')
      return '제2회 Dev Fest 만족도 조사 등록이 완료되었습니다.';
    return '제2회 Dev Fest 등록이 완료되었습니다.';
  }

  if (userType === 'TRAINEE') {
    if (formType === 'application')
      return '제2회 Dev Fest 등록이 완료되었습니다.';
    if (formType === 'survey')
      return '제2회 Dev Fest 만족도 조사 등록이 완료되었습니다.';
    return '제2회 Dev Fest 등록이 완료되었습니다.';
  }

  return '박람회 등록이 완료되었습니다';
};
