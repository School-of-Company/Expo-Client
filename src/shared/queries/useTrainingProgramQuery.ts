import { useQuery } from '@tanstack/react-query';
import { getAdminTrainingProgram } from '../api';
import { TrainingProgramItem } from '../types/program/list/type';
import { programQueryKeys } from './programQueryKeys';

// 관리자 화면(박람회 상세·수정, 프로그램 목록) 전용. 참가자 화면은 getTrainingProgram 을 쓴다
export const useTrainingProgram = (id: string, enabled = true) => {
  return useQuery<TrainingProgramItem[], Error>({
    queryKey: programQueryKeys.training(id),
    queryFn: () => getAdminTrainingProgram(id),
    enabled,
  });
};
