declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: { address: string }) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

export {};
