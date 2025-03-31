import React, { useRef, useState, useLayoutEffect } from 'react';

interface Props {
  title: string;
  content: string;
}

const ContentText = ({ title, content }: Props) => {
  const [more, setMore] = useState(false);
  const [show, setShow] = useState(false);
  const ContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ContentRef.current)
      setShow(ContentRef.current.scrollHeight > 5 * 1.6 * 16);
  }, [content]);

  return (
    <div className="flex flex-col gap-[0.88rem] space-y-4 overflow-hidden">
      <p className="text-body1b text-gray-600">{title}</p>
      <div>
        <p
          ref={ContentRef}
          className={`text-body2 ${!more && 'line-clamp-5'} overflow-hidden break-words text-gray-400`}
        >
          {content}
        </p>
        {show && (
          <button
            className={`text-left text-caption1r ${more ? 'text-main-600' : 'text-gray-300'}`}
            onClick={() => setMore(!more)}
          >
            {more ? '접기' : '더보기'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentText;
