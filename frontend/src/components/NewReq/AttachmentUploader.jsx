import PropTypes from "prop-types";
import { useTheme } from "../../contexts/ThemeContext";
import { FaTimes, FaFilePdf, FaFileWord, FaPaperclip } from "react-icons/fa";
import H4 from "../../utils/Headings/H4";

const getFileIcon = (filename, isDarkMode) => {
  const ext = filename.split(".").pop().toLowerCase();
  const baseClasses = "mr-2 text-lg flex-shrink-0";
  switch (ext) {
    case "pdf":
      return <FaFilePdf className={`${baseClasses} ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />;
    case "doc":
    case "docx":
      return <FaFileWord className={`${baseClasses} ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />;
    default:
      return <FaPaperclip className={`${baseClasses} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />;
  }
};

const AttachmentUploader = ({ attachments, onChange, onRemove }) => {
  const { isDarkMode } = useTheme();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).filter((file) =>
      [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ].includes(file.type)
    );
    onChange([...attachments, ...newFiles]);
    e.target.value = null;
  };

  const dropzoneClasses = `block w-full cursor-pointer rounded-lg p-6 text-center transition-all border-2 border-dashed ${
    isDarkMode
      ? 'bg-dark-600 border-gray-500 hover:bg-dark-500 hover:border-gray-400'
      : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
  }`;

  const chipBg = isDarkMode ? 'bg-dark-700 text-gray-200' : 'bg-gray-100 text-gray-800';
  const chipHoverBg = isDarkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200';
  const chipRemove = isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500';

  return (
    <div className="mb-6">
      <H4
        text="Attachments"
        className={`font-medium mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
      />

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {attachments.map((file, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-3 py-2 rounded-lg shadow-sm text-sm ${chipBg} ${chipHoverBg} transition-transform transform hover:scale-105 cursor-pointer`}
              onMouseEnter={() => {}}
            >
              <div className="flex items-center overflow-hidden">
                {getFileIcon(file.name || file.filename, isDarkMode)}
                <span className="truncate">{file.name || file.filename}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={`ml-2 transition-colors ${chipRemove}`}
                title="Remove attachment"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}

      <label htmlFor="file-upload" className={dropzoneClasses}>
        <div className="flex flex-col items-center justify-center">
          <FaPaperclip
            className={`${isDarkMode ? 'text-gray-300' : 'text-gray-400'} text-2xl mb-2`}
          />
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Click or drag files to upload (PDF, DOC, DOCX)
          </span>
        </div>
        <input
          id="file-upload"
          type="file"
          name="attachments"
          accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

AttachmentUploader.propTypes = {
  attachments: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default AttachmentUploader;
