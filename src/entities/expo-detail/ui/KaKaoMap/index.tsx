'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

interface KakaoMapProps {
  latitude: number;
  longitude: number;
}

export default function KakaoMap({ latitude, longitude }: KakaoMapProps) {
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

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&autoload=false`}
        onLoad={() => window.kakao.maps.load(loadKakaoMap)}
      />
      <div ref={mapRef} className="h-[400px] w-full" />
    </>
  );
}
