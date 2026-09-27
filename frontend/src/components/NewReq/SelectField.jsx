import H4 from "../../utils/Headings/H4.jsx";
import PropTypes from "prop-types";
import { useEffect } from "react";

// In SelectField.jsx
const SelectField = ({ title, options, onChange, error, value, id }) => {
  return (
    <div className="mb-4">
      <H4 text={title} className="font-medium" />
      <select
        className={`flex p-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md focus:outline-none focus:border-gray-400 w-full bg-white dark:bg-dark-50 dark:text-gray-100`}
        onChange={onChange}
        value={value || ""}
        id={id}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options?.map((option) => (
          <option
            key={option.value}
            value={option.value}
            selected={value === option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

SelectField.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  value: PropTypes.string,
  id: PropTypes.string,
};

export default SelectField;
