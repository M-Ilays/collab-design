import PropTypes from "prop-types";
import PrimaryButton from "../utils/Buttons/PrimaryButton.jsx";

const showError = ({ text, onClose }) => {
  // Safely handle different types of input
  const getErrorMessage = (input) => {
    if (typeof input === 'string') {
      return input.split("/")[1]
        ? input.split("/")[1].slice(0, -2).trim()
        : input;
    }
    if (typeof input === 'object' && input !== null) {
      return input.message || 'An error occurred';
    }
    return 'An error occurred';
  };

  const errorMessage = getErrorMessage(text);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-dark-900 p-8 rounded-xl shadow-lg mx-4 flex flex-col items-center">
        <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-primary">
          Error
        </h2>
        <p className="text-gray-700 mb-4 dark:text-white">{errorMessage}</p>
        <PrimaryButton action={onClose} text={"Close"} />
      </div>
    </div>
  );
};

showError.propTypes = {
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.number
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default showError;
