type SmallButtonProps = {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
};

const SmallButton = ({ text, onClick, disabled }: SmallButtonProps) => {
  return (
    <button
      type="button"
      className="rounded-sm bg-main-600 px-[30px] py-[6px] text-body2r text-white disabled:cursor-not-allowed disabled:opacity-40"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default SmallButton;
