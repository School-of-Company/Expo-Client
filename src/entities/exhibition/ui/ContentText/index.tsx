import React, { useRef, useState, useEffect } from 'react';
import { TextButton } from '@/shared/ui';

interface Props {
  title: string;
  content: string;
}

const ContentText = ({ title, content }: Props) => {
  const [show, setShow] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);
  const ContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ContentRef.current) {
      setIsExpandable(ContentRef.current.scrollHeight > 120);
    }
  }, [content]);

  return (
    <div className="flex flex-col gap-14 overflow-hidden">
      <p className="text-body1b text-gray-600">{title}</p>
      <div>
        <p
          ref={ContentRef}
          className={`text-body2r ${!show && 'line-clamp-5'} overflow-hidden break-words text-gray-400`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {content}
        </p>
        {/* 긴 소개가 프로그램·지도를 밀어내지 않게 5줄까지만 보이고 펼칠 수 있게 둔다 */}
        {isExpandable && (
          <TextButton
            size="small"
            tone={show ? 'gray' : 'main'}
            aria-expanded={show}
            className="mt-8"
            onClick={() => setShow(!show)}
          >
            {show ? '접기' : '전체 보기'}
          </TextButton>
        )}
      </div>
    </div>
  );
};

export default ContentText;
