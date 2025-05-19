import axios from 'axios';

export const convertAddressToCoordinates = async (
  address: string,
): Promise<{ lat: number; lng: number }> => {
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

    throw new Error('주소 변환에 실패했습니다.');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '주소 변환에 실패했습니다.');
    }
    throw error;
  }
};
