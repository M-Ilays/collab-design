import PropTypes from "prop-types";

const H3 = ({text, className}) => {
    return (
        <>
            <h3 className={`text-xl pb-2 font-semibold text-primary-heading ${className}`}>{text}</h3>
        </>
    );
}
H3.propTypes = {
    text: PropTypes.string.isRequired,
    className: PropTypes.string
}

export default H3;