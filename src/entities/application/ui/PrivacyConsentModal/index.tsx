import { XMark } from '@/shared/assets/icons';

interface PrivacyConsentModalProps {
  content: string;
  onClose: () => void;
}

const PrivacyConsentModal = ({
  content,
  onClose,
}: PrivacyConsentModalProps) => {
  return (
    <div className="w-full max-w-[656px] space-y-16 rounded-sm bg-white p-28">
      <div className="flex items-center justify-between">
        <h1 className="text-h2b text-black">개인정보 동의</h1>
        <button type="button" onClick={onClose}>
          <XMark />
        </button>
      </div>
      <p
        className="text-caption2r text-gray-500"
        style={{ whiteSpace: 'pre-line' }}
      >
        {content}
      </p>
    </div>
  );
};

export default PrivacyConsentModal;
