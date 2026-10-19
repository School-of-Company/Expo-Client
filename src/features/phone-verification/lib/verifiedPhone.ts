// 세션 응답에는 전화번호가 없어서, 이미 인증된 채로 "계속하기"를 눌러도 번호를 붙일 수 있게 탭 안에만 보관한다
const key = (expoId: string) => `verifiedPhone:${expoId}`;

export const saveVerifiedPhone = (expoId: string, phoneNumber: string) => {
  try {
    sessionStorage.setItem(key(expoId), phoneNumber);
  } catch {
    // 저장소를 못 쓰면 번호 없이 진행한다
  }
};

// 인증을 해제하면 다음 사람에게 앞사람 번호가 붙지 않도록 지운다
export const clearVerifiedPhone = (expoId: string) => {
  try {
    sessionStorage.removeItem(key(expoId));
  } catch {
    // 저장소를 못 쓰면 남은 번호도 없다
  }
};

export const loadVerifiedPhone = (expoId: string) => {
  try {
    return sessionStorage.getItem(key(expoId)) ?? undefined;
  } catch {
    return undefined;
  }
};
