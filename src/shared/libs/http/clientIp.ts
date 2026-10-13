// IP 처럼 보이는 값만 받는다(IPv4·IPv6). 헤더에 다른 문자열을 실어 넘기지 않기 위해서다
const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

/**
 * 요청한 브라우저의 IP. X-Forwarded-For 는 클라이언트가 직접 넣을 수 있어 가장 가까운 프록시가
 * 덧붙인 맨 오른쪽 값만 쓰고, 없으면 X-Real-IP 를 쓴다. 둘 다 없거나 IP 형식이 아니면 null
 */
export const getClientIp = (req: Request): string | null => {
  const forwarded = req.headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .pop();
  const ip = forwarded || req.headers.get('x-real-ip')?.trim();
  return ip && IP_PATTERN.test(ip) ? ip : null;
};

/**
 * Gateway 로 넘길 클라이언트 IP 헤더. Gateway 는 이 IP 로 요청 수를 제한하므로,
 * 넘기지 않으면 모든 사용자가 Next 서버 IP 하나로 묶여 한도를 함께 쓰게 된다
 */
export const clientIpHeaders = (req: Request): Record<string, string> => {
  const ip = getClientIp(req);
  return ip ? { 'X-Forwarded-For': ip } : {};
};
