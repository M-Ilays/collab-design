import PropTypes from "prop-types";
import PrimaryButton from "../utils/Buttons/PrimaryButton.jsx";

const ConfirmationPrompt = ({
  text,
  onConfirm,
  onCancel,
  onConfirmClassName,
  isProcessing,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-dark-900 p-8 rounded-xl shadow-lg mx-4 flex flex-col items-center"
      >
        <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-primary">
          Are you sure?
        </h2>
        <p className="text-gray-700 mb-4 dark:text-white">{text}</p>
        <div className="flex space-x-4">
          <PrimaryButton
            action={onConfirm}
            text={isProcessing ? "Processing..." : "Yes, Delete"}
            className={onConfirmClassName}
            disabled={isProcessing}
          />
          <PrimaryButton
            action={onCancel}
            text="No, Cancel"
            className="bg-gray-500 hover:bg-gray-600"
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

ConfirmationPrompt.propTypes = {
  text: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirmClassName: PropTypes.string,
};

export default ConfirmationPrompt;
