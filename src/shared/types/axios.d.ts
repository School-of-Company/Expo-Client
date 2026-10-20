import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _isRetry?: boolean;
  }
}
