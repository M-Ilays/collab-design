import PropTypes from "prop-types";

const SecondaryInput = ({
  value,
  placeHolder,
  className = "",
  onChange,
  onKeyDown,
  isRequired,
  type = "text",
  error,
  disabled,
}) => {
  return (
    <div className="w-full">
      <input
        disabled={disabled}
        value={value}
        placeholder={placeHolder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        required={isRequired}
        type={type}
        className={`
          w-full border
          ${error ? "border-red-500" : "border-gray-300"}
          rounded px-4 py-2
          focus:outline-none focus:ring-2 focus:ring-primary
          bg-white dark:bg-dark text-gray-800 dark:text-white
          disabled:bg-gray-100 dark:disabled:bg-gray-800
          disabled:text-gray-500 dark:disabled:text-gray-400
          disabled:cursor-not-allowed
          ${className}
        `}
      />
      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

SecondaryInput.propTypes = {
  value: PropTypes.string,
  placeHolder: PropTypes.string.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  isRequired: PropTypes.bool,
  type: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

export default SecondaryInput;
