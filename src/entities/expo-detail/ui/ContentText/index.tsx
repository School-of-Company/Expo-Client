import React from 'react';

interface Props {
  title: string;
  content: string;
}

const ContentText = ({ title, content }: Props) => {
  return (
    <div className="space-y-4">
      <p className="text-body1 text-gray-600">{title}</p>
      <p className="text-body2 text-gray-400">
        {content.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  );
};

export default ContentText;
