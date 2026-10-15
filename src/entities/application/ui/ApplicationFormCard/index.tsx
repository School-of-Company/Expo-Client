import Link from 'next/link';

interface Props {
  category: string;
  title: string;
  description: string;
  period: string;
  statusLabel: string;
  isOpen: boolean;
  buttonLabel: string;
  href: string;
}

const ApplicationFormCard = ({
  category,
  title,
  description,
  period,
  statusLabel,
  isOpen,
  buttonLabel,
  href,
}: Props) => {
  return (
    <div className="flex flex-col gap-16 rounded-sm border-1 border-solid border-gray-200 bg-white p-18">
      <div className="flex items-start justify-between gap-12">
        <div className="flex flex-col gap-4">
          <p className="text-caption1r text-main-600">{category}</p>
          <p className="text-h3b text-black">{title}</p>
        </div>
        <span
          className={`whitespace-nowrap rounded-sm border-1 border-solid px-16 py-8 text-caption1r ${
            isOpen
              ? 'border-main-300 bg-main-100 text-main-600'
              : 'border-gray-200 bg-white text-gray-400'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {description && (
        <p
          className="overflow-hidden text-body2r text-gray-500"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          {description}
        </p>
      )}

      <p className="text-caption1r text-gray-500">신청 기간 {period}</p>

      {isOpen ? (
        <Link
          href={href}
          className="rounded-sm bg-main-600 px-24 py-14 text-center text-body2b text-white"
        >
          {buttonLabel}
        </Link>
      ) : (
        <span
          aria-disabled
          className="cursor-not-allowed rounded-sm bg-gray-400 px-24 py-14 text-center text-body2b text-white"
        >
          {buttonLabel}
        </span>
      )}
    </div>
  );
};

export default ApplicationFormCard;
