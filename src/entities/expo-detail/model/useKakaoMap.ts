import { useEffect, useRef } from 'react';

interface KakaoMapOptions {
  latitude: number;
  longitude: number;
}

export const useKakaoMap = ({ latitude, longitude }: KakaoMapOptions) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const loadKakaoMap = () => {
    if (typeof window.kakao === 'undefined' || !mapRef.current) return;

    const position = new window.kakao.maps.LatLng(latitude, longitude);

    const options = {
      center: position,
      level: 3,
    };

    const map = new window.kakao.maps.Map(mapRef.current, options);

    const marker = new window.kakao.maps.Marker({
      position: position,
    });

    marker.setMap(map);
  };

  useEffect(() => {
    loadKakaoMap();
  }, [latitude, longitude]);

  return { mapRef, loadKakaoMap };
};
