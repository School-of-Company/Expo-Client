import clientInstance from './clientInstance';

// 프로그램 신청 같은 참가자 세션 POST 는 CSRF 헤더가 필요하다. 이 호출이 XSRF-TOKEN 쿠키를 심고(프록시가
// Set-Cookie 를 돌려준다) 쓸 헤더 이름과 값을 준다. 프록시가 넘기는 헤더는 X-XSRF-TOKEN·X-CSRF-TOKEN 뿐이다.
// 내 신청 취소의 CSRF 는 이것이 아니라 내 신청 조회 응답의 X-CSRF-TOKEN 헤더를 쓴다(myApplications.ts)
export const getProgramSessionCsrfHeaders = async (): Promise<
  Record<string, string>
> => {
  const { data } = await clientInstance.get<{
    token: string;
    headerName: string;
  }>('/application/program-session-csrf');
  return { [data.headerName]: data.token };
};
