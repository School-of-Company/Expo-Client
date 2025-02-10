import axios from 'axios';

export const convertAddressToCoordinates = async (
  address: string,
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await axios.get(
      `/api/map/change-local?address=${encodeURIComponent(address)}`,
    );

    const data = response.data;

    if (data.documents.length > 0) {
      const { x, y } = data.documents[0].address;
      return {
        lat: parseFloat(parseFloat(y).toFixed(7)),
        lng: parseFloat(parseFloat(x).toFixed(7)),
      };
    }
  } catch (error) {
    console.error('주소 변환 오류:', error);
  }
  return null;
};
