interface Props {
  address: string;
  detailAddress: string;
}

const ShowLocation = ({ address, detailAddress }: Props) => {
  return (
    <div className="flex flex-col gap-[0.88rem]">
      <p className="text-body1b text-gray-600">장소</p>
      <ul className="text-body2r text-gray-400">
        <li>주소 : {address}</li>
        <li>상세주소 : {detailAddress}</li>
      </ul>
    </div>
  );
};

export default ShowLocation;
