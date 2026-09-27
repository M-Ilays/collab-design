import PropTypes from "prop-types";

const H2 = ({text, className}) => {
    return (
        <>
            <h2 className={`text-3xl font-bold text-primary-heading ${className}`}>{text}</h2>
        </>
    );
}
H2.propTypes = {
    text: PropTypes.string.isRequired,
    className: PropTypes.string
}

export default H2;