export type RequestData =
  | FormData
  | Record<string, unknown>
  | string
  | undefined;

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}
