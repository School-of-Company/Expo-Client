export const USER_AUTHORITY = {
  STANDARD: 'STANDARD',
  TRAINEE: 'TRAINEE',
} as const;

export type UserAuthority =
  (typeof USER_AUTHORITY)[keyof typeof USER_AUTHORITY];

// 넘긴 값에 맞는 ROLE_ 리터럴을 돌려줘 요청 타입을 권한별로 좁힐 수 있게 한다
export const toRoleAuthority = <A extends UserAuthority>(authority: A) =>
  `ROLE_${authority}` as const;
