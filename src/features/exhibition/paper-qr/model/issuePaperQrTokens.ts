import { postQrTokens } from '../api/postQrTokens';
import { MAX_TOKENS_PER_REQUEST, PaperQrCategory } from './constants';

export interface PaperQrBatch {
  category: PaperQrCategory;
  tokens: string[];
}

// 구분별 장수만큼 발급한다. 한 번에 1000장까지라 넘으면 나눠서 요청한다
export const issuePaperQrTokens = async (
  expoId: string,
  counts: { category: PaperQrCategory; count: number }[],
): Promise<PaperQrBatch[]> => {
  const batches: PaperQrBatch[] = [];

  for (const { category, count } of counts) {
    if (count <= 0) continue;
    const tokens: string[] = [];
    for (let issued = 0; issued < count; issued += MAX_TOKENS_PER_REQUEST) {
      const size = Math.min(MAX_TOKENS_PER_REQUEST, count - issued);
      tokens.push(...(await postQrTokens(expoId, size, category)));
    }
    batches.push({ category, tokens });
  }

  return batches;
};
