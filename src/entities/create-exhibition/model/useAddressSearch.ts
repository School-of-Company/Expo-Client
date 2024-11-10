import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';

export type FormData = {
  title: string;
  introduction: string;
  address: string;
  trainings: { name: string }[];
  image: File | null;
};

interface AddressData {
  address: string;
}

export const useAddressSearch = (setValue: UseFormSetValue<FormData>) => {
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
        console.log(data.address);
        setValue('address', data.address);
      },
    }).open();
  };

  return {
    openAddressSearch,
  };
};
