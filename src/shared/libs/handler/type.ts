export type RequestData =
  | FormData
  | Record<string, unknown>
  | string
  | undefined;

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
  /** 쿠키 만료 시각(ISO). 캐시된 결과로 쿠키를 다시 구울 때 쓴다 */
  accessTokenExpires?: string;
  refreshTokenExpires?: string;
}
