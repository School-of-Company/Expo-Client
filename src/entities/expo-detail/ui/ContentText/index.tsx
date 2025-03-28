import React, { useRef, useState } from 'react';

interface Props {
  title: string;
  content: string;
}

const ContentText = ({ title, content }: Props) => {
  const [show, setShow] = useState(false);
  const ContentRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col gap-[0.88rem] space-y-4 overflow-hidden">
      <p className="text-body1b text-gray-600">{title}</p>
      <div>
        <p
          ref={ContentRef}
          className={`text-body2 ${!show && 'line-clamp-5'} overflow-hidden break-words text-gray-400`}
        >
          {content}
        </p>
        {(ContentRef.current?.scrollHeight ?? 0) > 120 && (
          <button
            className={`text-left text-caption1r ${show ? 'text-main-600' : 'text-gray-300'}`}
            onClick={() => setShow(!show)}
          >
            {show ? '접기' : '더보기'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentText;
