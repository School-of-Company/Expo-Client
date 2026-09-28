export const USER_AUTHORITY = {
  STANDARD: 'STANDARD',
  TRAINEE: 'TRAINEE',
} as const;

export type UserAuthority =
  (typeof USER_AUTHORITY)[keyof typeof USER_AUTHORITY];

export const toRoleAuthority = (authority: UserAuthority) =>
  `ROLE_${authority}` as const;
