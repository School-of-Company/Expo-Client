import {
  ProgramPolicy,
  StandardProgramRequest,
  TrainingProgramRequest,
} from '../../program/list/type';

// 박람회 수정은 프로그램 전체를 교체한다. id가 null이면 새 프로그램이고,
// 기존 프로그램은 조회한 revision을 돌려보낸다 (ExpoUpdate*ProgramRequest)
interface ExpoUpdateProgramRef {
  id: number | null;
  revision: number | null;
  policy: ProgramPolicy | null;
}

export interface AddressResponse {
  meta: {
    total_count: number;
  };
  documents: Array<{
    road_address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      road_name: string;
      underground_yn: string;
      main_building_no: string;
      sub_building_no: string;
      building_name: string;
      zone_no: string;
    };
    address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      mountain_yn: string;
      main_address_no: string;
      sub_address_no: string;
      zip_code: string;
    };
  }>;
}

export interface EditExhibitionData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: string;
  y: string;
  updateStandardProRequestDto: (StandardProgramRequest &
    ExpoUpdateProgramRef)[];
  updateTrainingProRequestDto: (TrainingProgramRequest &
    ExpoUpdateProgramRef)[];
}
