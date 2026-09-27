import PropTypes from "prop-types";

const H1 = ({ Text, TextSize, className }) => {
  let classes = "font-bold text-primary ";
  TextSize ? (classes += TextSize) : (classes += "text-2xl ");
  className ? (classes += className) : (classes += "");
  return <h1 className={classes}>{Text}</h1>;
};

H1.propTypes = {
  Text: PropTypes.string.isRequired,
  TextSize: PropTypes.string,
};

export default H1;
