import PropTypes from "prop-types";

const H4 = ({text,className}) => {

    return (<div className={`text-lg font-bold text-gray-700 my-2 dark:text-gray-100 ${className}`}>{text}</div>);

}

H4.propTypes = {
    text: PropTypes.string.isRequired,
    className: PropTypes.string
}
export default H4;


