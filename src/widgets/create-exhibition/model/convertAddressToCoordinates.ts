import { fetchAddressData } from '../api/kakaoApi';

export const convertAddressToCoordinates = async (
  address: string,
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const data = await fetchAddressData(address);

    if (data.documents.length > 0) {
      const { x, y } = data.documents[0].address;
      return {
        lat: parseFloat(y),
        lng: parseFloat(x),
      };
    } else {
      console.log('주소 결과가 없습니다.');
    }
  } catch (error) {
    console.error('주소 변환 오류:', error);
  }
  return null;
};
