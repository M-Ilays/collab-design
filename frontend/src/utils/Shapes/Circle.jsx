import PropTypes from "prop-types";

const Circle = ({
  text,
  colour = "bg-primary",
  className,
  style,
  ImageUrl,
}) => {
  let padding = !ImageUrl ? "p-2" : "";
  return (
    <div
      className={`rounded-full w-6 sm:w-8 h-6 sm:h-8  flex items-center justify-center text-white text-xs  sm:text-base ${padding} ${colour} ${
        className || ""
      }`}
      style={style}
    >
      {ImageUrl ? (
        <img
          src={ImageUrl}
          alt="User Profile Picture"
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        text
      )}
    </div>
  );
};

Circle.propTypes = {
  colour: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Circle;
