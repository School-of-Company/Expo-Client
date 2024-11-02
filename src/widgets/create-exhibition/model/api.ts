import axios from 'axios';

const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

export const convertAddressToCoordinates = async (
  address: string,
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
      address,
    )}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    });

    if (response.status === 200 && response.data.documents.length > 0) {
      const { x, y } = response.data.documents[0].address;
      const coordinates = {
        lat: parseFloat(y),
        lng: parseFloat(x),
      };
      return coordinates;
    } else {
      console.log('주소 결과가 없습니다.');
    }
  } catch (error) {
    console.error('주소 변환 오류:', error);
  }
  return null;
};
