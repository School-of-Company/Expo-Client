'use client';

import { AxiosInstance } from 'axios';
import { createContext, ReactNode, useContext } from 'react';
import clientTokenInstance from './clientTokenInstance';

/**
 * 입장·퇴장·간편입장·프로그램 출석 요청을 보낼 인스턴스. 관리자 화면은 기본값(관리자 쿠키 프록시)을 쓰고,
 * 스태프 링크 화면은 스태프 토큰 인스턴스로 바꿔 같은 스캔 화면 조각을 그대로 쓴다
 */
const ScanHttpContext = createContext<AxiosInstance>(clientTokenInstance);

export const ScanHttpProvider = ({
  http,
  children,
}: {
  http: AxiosInstance;
  children: ReactNode;
}) => (
  <ScanHttpContext.Provider value={http}>{children}</ScanHttpContext.Provider>
);

export const useScanHttp = () => useContext(ScanHttpContext);
