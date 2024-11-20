import axios from 'axios';

export const fetchAddressData = async (address: string) => {
  try {
    const response = await axios.get(
      `/api/map?address=${encodeURIComponent(address)}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching address data:', error);
    throw error;
  }
};
