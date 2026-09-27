import PropTypes from "prop-types";

const Rectangle = ({ text, colour, index }) => {
    const colors = [
        "bg-blue-200 text-blue-800",
        "bg-green-200 text-green-800",
        "bg-indigo-200 text-indigo-800",
        "bg-yellow-200 text-yellow-800",
        "bg-gray-200 text-gray-700"
    ];
    return (
        <div className={`px-2 py-1 text-sm rounded min-h-[28px] ${colour} ${colors[index % colors.length]}`}>
            {text}
        </div>
    );
}

Rectangle.propTypes = {
    text: PropTypes.string.isRequired,
    colour: PropTypes.string,
    index: PropTypes.number
}

export default Rectangle;