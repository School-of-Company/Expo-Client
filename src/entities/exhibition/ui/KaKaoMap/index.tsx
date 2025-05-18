'use client';

import Script from 'next/script';
import { useKakaoMap } from '../../model/useKakaoMap';

interface KakaoMapProps {
  latitude: number;
  longitude: number;
}

const KakaoMap = ({ latitude, longitude }: KakaoMapProps) => {
  const { mapRef, loadKakaoMap } = useKakaoMap({ latitude, longitude });

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
};

export default KakaoMap;
