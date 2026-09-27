import H4 from "../../utils/Headings/H4.jsx";
import PropTypes from "prop-types";

const FormTextArea = ({ title, ariaLabel, onChange, error, value, id }) => {
  return (
    <div className="mb-4">
      <H4 text={title} className="font-medium" />
      <textarea
        id={id}
        aria-label={ariaLabel}
        value={value || ""}
        onChange={onChange}
        className={`w-full mt-2 p-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md dark:bg-dark-50 focus:outline-none focus:border-gray-400 min-h-[100px]`}
        placeholder={ariaLabel}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

FormTextArea.propTypes = {
  title: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  value: PropTypes.string,
  id: PropTypes.string,
};

export default FormTextArea;
