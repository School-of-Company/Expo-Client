import type { Occupation } from '@/entities/form/constants/occupationData';
import type {
  DynamicFormItemRequest,
  FormParticipantType,
} from '@/entities/form/model/types';
import type { SurveyAnswers } from '@/shared/types/application/type';

/** 설문 문항. 폼 필드와 같고 `dynamicFormType`만 없다. */
export type DynamicSurveyItemRequest = Omit<
  DynamicFormItemRequest,
  'dynamicFormType'
>;

export interface DynamicSurveyItemResponse extends DynamicSurveyItemRequest {
  id: number;
}

/** 후기 설문. (박람회, 참여자군) 조합당 하나다. 폼과 달리 필드명이 `participationType`이다. */
export interface CreateSurveyRequestDto {
  title: string;
  informationText: string;
  participationType: FormParticipantType;
  dynamicSurveyRequestDto: DynamicSurveyItemRequest[];
  lotteryEnabled?: boolean;
  lotteryNumbers?: number[];
}

/** 문항이 통째로 교체되어 id가 새로 발급된다. 이미 쌓인 답변과의 연결이 끊긴다. */
export type UpdateSurveyRequestDto = CreateSurveyRequestDto;

export interface CreateSurveyResponseDto {
  id: string;
}

export interface SurveyResponseDto {
  id: string;
  expoId: string;
  title: string;
  informationText: string;
  participationType: FormParticipantType;
  totalAnswers: number;
  dynamicSurveyResponseDto: DynamicSurveyItemResponse[];
}

/** 일반 참가자 설문. `lotteryEnabled`일 때만 경품 번호 입력을 보여 준다. */
export interface PublicSurveyResponseDto extends SurveyResponseDto {
  lotteryEnabled: boolean;
}

export type { SurveyAnswers };

export interface SubmitSurveyAnswerRequestDto {
  phoneNumber: string;
  personalInformationStatus: boolean;
  answers: SurveyAnswers;
}

/** 익명 답변. 번호와 동의를 함께 보내면 당첨됐을 때 문자를 보낸다. */
export interface SubmitPublicSurveyAnswerRequestDto {
  answers: SurveyAnswers;
  occupation?: Occupation;
  phoneNumber?: string;
  personalInformationStatus?: boolean;
}

export interface PublicSurveyAnswerResponseDto {
  won: boolean;
  drawNumber: number | null;
}

export interface SurveyLotteryResponseDto {
  enabled: boolean;
  /** 1 이상의 정수, 중복 없이 최대 100개. 비우면 추첨하지 않는다. */
  numbers: number[];
  /** 번호를 입력한 응답자만 센 현재 순번. 끄고 켜도 이어서 센다. */
  currentSequence: number;
}

export type UpdateSurveyLotteryRequestDto = Pick<
  SurveyLotteryResponseDto,
  'enabled' | 'numbers'
>;
