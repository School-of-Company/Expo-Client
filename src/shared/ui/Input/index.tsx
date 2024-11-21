import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
} from 'react';

interface Props
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  icon?: ReactNode;
  onIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, Props>(
  (
    { type, placeholder, icon, onChange, value, onIconClick, ...props },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputStyle = {
      WebkitBoxShadow: '0 0 0 30px white inset !important',
      WebkitTextFillColor: 'inherit !important',
    };

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="flex rounded-sm border-1 border-solid border-gray-200 px-6 py-5 duration-200"
        >
          <input
            {...props}
            id={inputId}
            ref={ref}
            type={type}
            className="w-full border-none bg-transparent text-body4 outline-none"
            style={inputStyle}
            placeholder={placeholder}
            onChange={handleChange}
            value={value}
          />
          {icon && (
            <div
              className="h-5 w-5 cursor-pointer"
              onClick={onIconClick}
              role="button"
              tabIndex={0}
              aria-label="icon"
            >
              {icon}
            </div>
          )}
        </label>
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
