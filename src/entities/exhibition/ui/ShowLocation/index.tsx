import { useAddressQuery } from '@/features/exhibition/detail';

interface Props {
  latitude: number;
  longitude: number;
  detailAddress: string;
}

const ShowLocation = ({ latitude, longitude, detailAddress }: Props) => {
  const { data: address } = useAddressQuery(latitude, longitude);

  return (
    <div className="flex flex-col gap-[0.88rem]">
      <p className="text-body1b text-gray-600">장소</p>
      <ul className="text-body2r text-gray-400">
        <li>주소 : {address || '주소를 찾을 수 없습니다.'}</li>
        <li>상세주소 : {detailAddress}</li>
      </ul>
    </div>
  );
};

export default ShowLocation;
