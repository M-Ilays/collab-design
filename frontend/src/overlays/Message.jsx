import PropTypes from "prop-types";
import PrimaryButton from "../utils/Buttons/PrimaryButton.jsx";

const Message = ({ text, onClose }) => {
  // Add click handler to overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-dark-900 p-8 rounded-xl shadow-lg mx-4 flex flex-col items-center"
      >
        <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-primary">
          Message
        </h2>
        <p className="text-gray-700 mb-4 dark:text-white">{text}</p>
        <PrimaryButton action={onClose} text={"Close"} />
      </div>
    </div>
  );
};

Message.propTypes = {
  text: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Message;
