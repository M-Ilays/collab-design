import PropTypes from "prop-types";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";

const PrimaryInput = ({
  placeHolder,
  className,
  onKeyDown,
  onChange,
  type = "text",
  value, // Ensure we accept value as a prop
  error,
  name,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`flex flex-col ${className} max-w-full`}>
      <div
        className={`flex justify-between items-center p-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md focus:outline-none focus:border-gray-400 bg-white dark:bg-dark-50 dark:text-gray-100`}
      >
        <input
          className="focus:outline-none w-full bg-transparent"
          placeholder={placeHolder}
          onKeyDown={onKeyDown}
          onChange={onChange}
          type={type === "password" && showPassword ? "text" : type}
          name={name}
          value={value} // Make sure we explicitly bind value to state
        />
        {type === "password" &&
          (showPassword ? (
            <FaRegEye onClick={togglePasswordVisibility} />
          ) : (
            <FaRegEyeSlash onClick={togglePasswordVisibility} />
          ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

PrimaryInput.propTypes = {
  placeHolder: PropTypes.string.isRequired,
  className: PropTypes.string,
  onKeyDown: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  value: PropTypes.string, // Ensure we define value in prop types
  error: PropTypes.string,
  name: PropTypes.string.isRequired,
};

export default PrimaryInput;
