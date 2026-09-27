import PropTypes from "prop-types";
import { FaFileDownload } from "react-icons/fa";
import { BACKEND_URL } from "../../constants/BACKEND";

const FileAttachment = ({ fileName, className, filePath }) => {
  const handleDownload = () => {
    const fullPath = `${BACKEND_URL}/${filePath}`; // Construct the full path
    window.open(fullPath, "_blank"); // Open the file in a new tab
  };

  return (
    <div
      onClick={handleDownload}
      className={`flex gap-2 cursor-pointer items-center px-4 py-2.5 rounded-md border border-solid hover:border-primary-subtitle border-slate-200 dark:text-gray-400 dark:hover:text-gray-100 dark:border-gray-100 dark:hover:border-gray-50 ${className}`}
    >
      <FaFileDownload />
      <div className="self-stretch my-auto hover:text-primary-heading dark:hover:text-gray-100">
        {fileName}
      </div>
    </div>
  );
};

FileAttachment.propTypes = {
  fileName: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default FileAttachment;
