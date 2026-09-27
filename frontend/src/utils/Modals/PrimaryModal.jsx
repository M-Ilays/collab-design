import PrimaryButton from "../Buttons/PrimaryButton";

const PrimaryModal = ({ onClose, heading, buttonText, children, onSubmit }) => {
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={handleOutsideClick}
    >
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-dark-900"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-dark-50">
          <h2 className="text-xl font-semibold text-primary">{heading}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        <div className="shrink-0 border-t border-gray-100 px-6 py-4 dark:border-dark-50">
          <PrimaryButton
            className="w-full justify-center"
            text={buttonText}
            action={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default PrimaryModal;
