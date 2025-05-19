import React, { useRef, useState, useEffect } from 'react';

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
        {isExpandable && (
          <button
            type="button"
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
