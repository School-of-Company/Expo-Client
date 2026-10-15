import { PaperQrItem, postQrTokens } from '../api/qrTokensApi';
import { MAX_TOKENS_PER_REQUEST, PaperQrCategory } from './constants';

export interface PaperQrIssueResult {
  items: PaperQrItem[];
  // 중간에 실패하면 그 오류. 앞서 받은 QR 은 items 에 남는다
  error: Error | null;
}

// 구분별 장수만큼 발급한다. 한 번에 1000장까지라 넘으면 나눠서 요청한다
// 뒤 요청이 실패해도 이미 발급된 QR 은 유효하므로 버리지 않고 돌려준다
export const issuePaperQrTokens = async (
  expoId: string,
  counts: { category: PaperQrCategory; count: number }[],
): Promise<PaperQrIssueResult> => {
  const items: PaperQrItem[] = [];
  try {
    for (const { category, count } of counts) {
      for (let issued = 0; issued < count; issued += MAX_TOKENS_PER_REQUEST) {
        const size = Math.min(MAX_TOKENS_PER_REQUEST, count - issued);
        items.push(...(await postQrTokens(expoId, size, category)));
      }
    }
  } catch (error) {
    return {
      items,
      error:
        error instanceof Error
          ? error
          : new Error('종이 QR 발급에 실패했습니다.'),
    };
  }
  return { items, error: null };
};
