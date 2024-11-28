import { useEffect, useRef } from 'react';

interface KakaoMapOptions {
  latitude: number;
  longitude: number;
}

export const useKakaoMap = ({ latitude, longitude }: KakaoMapOptions) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const loadKakaoMap = () => {
    if (!window.kakao || !mapRef.current) return;

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
    const initializeMap = () => {
      if (typeof window.kakao !== 'undefined') {
        loadKakaoMap();
      } else {
        console.error('Kakao Maps API가 로드되지 않았습니다.');
      }
    };

    if (document.readyState === 'complete') {
      initializeMap();
    } else {
      window.addEventListener('load', initializeMap);
      return () => window.removeEventListener('load', initializeMap);
    }
  }, [latitude, longitude]);

  return { mapRef, loadKakaoMap };
};
