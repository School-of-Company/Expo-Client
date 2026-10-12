import { postQrTokens } from '../api/postQrTokens';
import { MAX_TOKENS_PER_REQUEST, PaperQrCategory } from './constants';

export interface PaperQrBatch {
  category: PaperQrCategory;
  tokens: string[];
}

export interface PaperQrIssueResult {
  batches: PaperQrBatch[];
  // 중간에 실패하면 그 오류. 앞서 받은 토큰은 batches에 남는다
  error: Error | null;
}

// 구분별 장수만큼 발급한다. 한 번에 1000장까지라 넘으면 나눠서 요청한다
// 이미 발급된 토큰은 재조회할 수 없으므로 뒤 요청이 실패해도 버리지 않고 돌려준다
export const issuePaperQrTokens = async (
  expoId: string,
  counts: { category: PaperQrCategory; count: number }[],
): Promise<PaperQrIssueResult> => {
  const batches: PaperQrBatch[] = [];

  for (const { category, count } of counts) {
    if (count <= 0) continue;
    const tokens: string[] = [];
    try {
      for (let issued = 0; issued < count; issued += MAX_TOKENS_PER_REQUEST) {
        const size = Math.min(MAX_TOKENS_PER_REQUEST, count - issued);
        tokens.push(...(await postQrTokens(expoId, size, category)));
      }
    } catch (error) {
      if (tokens.length > 0) batches.push({ category, tokens });
      return {
        batches,
        error:
          error instanceof Error
            ? error
            : new Error('종이 QR 발급에 실패했습니다.'),
      };
    }
    batches.push({ category, tokens });
  }

  return { batches, error: null };
};
