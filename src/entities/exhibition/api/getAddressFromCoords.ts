import axios from 'axios';

export const getAddressFromCoords = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  try {
    const { data } = await axios.get('/api/map/change-geo', {
      params: {
        x: longitude,
        y: latitude,
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
