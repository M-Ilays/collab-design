import PropTypes from "prop-types";

const Pill = ({ Text, Color, className }) => {
  const colors = {
    red: "text-red-600 bg-red-100",
    green: "text-green-600 bg-green-100",
    yellow: "text-yellow-600 bg-yellow-100",
  };

  const selectedColors = colors[Color] || "";

  return (
    <div className="flex justify-center items-center">
      <span
        className={`${selectedColors} px-2 md:px-3 py-1 rounded-full text-xs ${className}`}
      >
        {Text}
      </span>
    </div>
  );
};

Pill.propTypes = {
  Text: PropTypes.string.isRequired,
  Color: PropTypes.string,
  className: PropTypes.string,
};

export default Pill;
