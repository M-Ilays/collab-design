
import PropTypes from "prop-types";

const Tag = ({ text, index, onRemove }) => {
    const colors = [
        "bg-blue-200 text-blue-800",
        "bg-green-200 text-green-800",
        "bg-indigo-200 text-indigo-800",
        "bg-yellow-200 text-yellow-800",
        "bg-gray-200 text-gray-700"
    ];
    return (
        <div
            className={`flex items-center gap-1 px-2 py-1 text-sm rounded min-h-[28px] ${colors[index % colors.length]}`}
        >
            <span>{text}</span>
            <button
                type="button"
                className="text-gray-700 hover:text-red-600 focus:outline-none"
                onClick={() => onRemove(index)} // Trigger tag removal
            >
                &times;
            </button>
        </div>
    );
};

Tag.propTypes = {
    text: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired
};

export default Tag;
