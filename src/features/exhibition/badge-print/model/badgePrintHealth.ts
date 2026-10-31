import type { BadgePrintJob, BadgePrintStation } from '../api/badgePrintApi';

// 이 시간 안에 요청이 있었으면 켜져 있는 출력대로 본다. 출력대는 2초마다 묻는다
export const STATION_ALIVE_MS = 20_000;
// 이보다 오래 대기 중인 명찰은 출력대가 멈췄을 수 있다
export const WAITING_ALERT_MS = 60_000;

// 서버 시각은 시간대 없는 한국 시간(LocalDateTime)이라 +09:00 을 붙여 읽는다
export const kstMillis = (value: string | null) =>
  value ? Date.parse(`${value.slice(0, 19)}+09:00`) : Number.NaN;

export const aliveStationCount = (stations: BadgePrintStation[], now: number) =>
  stations.filter(
    (station) =>
      !station.paused &&
      now - kstMillis(station.lastSeenAt) <= STATION_ALIVE_MS,
  ).length;

export const staleWaitingCount = (jobs: BadgePrintJob[], now: number) =>
  jobs.filter(
    (job) =>
      job.status === 'WAITING' &&
      now - kstMillis(job.updatedAt) > WAITING_ALERT_MS,
  ).length;
