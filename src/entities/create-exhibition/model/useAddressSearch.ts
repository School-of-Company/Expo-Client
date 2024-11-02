import { Dispatch, SetStateAction, useEffect } from 'react';

interface AddressData {
  address: string;
}

export const useAddressSearch = (
  setValue: Dispatch<SetStateAction<string>>,
) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data: AddressData) => {
        setValue(data.address);
      },
    }).open();
  };

  return {
    openAddressSearch,
  };
};
