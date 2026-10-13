// IP 처럼 보이는 값만 받는다(IPv4·IPv6). 헤더에 다른 문자열을 실어 넘기지 않기 위해서다
const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

/**
 * Next 앞에서 X-Forwarded-For 에 값을 덧붙이는 신뢰할 프록시 수(서버 환경 변수 TRUSTED_PROXY_HOPS).
 * 1 이면 맨 오른쪽, 2 면 끝에서 두 번째 값이 클라이언트 IP 다(예: CloudFront → ALB).
 * 설정하지 않으면 앞단 구성을 모르는 상태라 값이 클라이언트가 직접 적은 것일 수 있다
 */
const getTrustedProxyHops = () => {
  const hops = Number(process.env.TRUSTED_PROXY_HOPS);
  return Number.isInteger(hops) && hops > 0 ? hops : null;
};

/** 앞단 프록시 구성이 설정돼 IP 를 믿을 수 있는지 */
export const isClientIpTrusted = () => getTrustedProxyHops() !== null;

/**
 * 요청한 브라우저의 IP. X-Forwarded-For 의 끝에서 신뢰할 프록시 수만큼 거슬러 간 값을 쓰고
 * (설정이 없으면 맨 오른쪽), 없으면 X-Real-IP 를 쓴다. 둘 다 없거나 IP 형식이 아니면 null
 */
export const getClientIp = (req: Request): string | null => {
  const forwarded = (req.headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const hops = getTrustedProxyHops() ?? 1;
  const ip =
    forwarded[forwarded.length - hops] ?? req.headers.get('x-real-ip')?.trim();
  return ip && IP_PATTERN.test(ip) ? ip : null;
};

/**
 * Gateway 로 넘길 클라이언트 IP 헤더. Gateway 는 이 IP 로 요청 수를 제한하므로,
 * 넘기지 않으면 모든 사용자가 Next 서버 IP 하나로 묶여 한도를 함께 쓰게 된다.
 * requireTrusted 면 앞단 구성이 설정됐을 때만 넘긴다(로그인처럼 위조한 IP 로 시도 제한을 피하면 안 되는 요청)
 */
export const clientIpHeaders = (
  req: Request,
  { requireTrusted = false }: { requireTrusted?: boolean } = {},
): Record<string, string> => {
  if (requireTrusted && !isClientIpTrusted()) return {};
  const ip = getClientIp(req);
  return ip ? { 'X-Forwarded-For': ip } : {};
};
