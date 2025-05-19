import axios from 'axios';

export const getAddressFromCoords = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  try {
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`;

    const { data } = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
      },
    });

    if (data.documents.length === 0 || !data.documents[0].road_address) {
      throw new Error('주소를 찾을 수 없습니다.');
    }

    return data.documents[0].road_address.address_name;
  } catch (e) {
    throw new Error('주소를 찾을 수 없습니다.');
  }
};
