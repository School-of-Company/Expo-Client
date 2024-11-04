declare global {
  interface LatLng {
    lat: number;
    lng: number;
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  interface Map {
    setCenter: (latlng: LatLng) => void;
    setLevel: (level: number) => void;
  }

  interface Marker {
    setMap: (map: Map) => void;
  }

  interface KakaoMaps {
    LatLng: new (lat: number, lng: number) => LatLng;
    Map: new (container: HTMLElement, options: MapOptions) => Map;
    Marker: new (options: { position: LatLng }) => Marker;
    load: (callback: () => void) => void;
  }

  interface Window {
    kakao: {
      maps: KakaoMaps;
    };
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
