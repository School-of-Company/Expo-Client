export const getHeaderTitleByUserType = (userType: string | null): string => {
  switch (userType) {
    case 'STANDARD':
      return '현장 참가자';
    case 'TRAINEE':
      return '현장 연수자';
    default:
      return '유효하지 않은 유저 타입';
  }
};
