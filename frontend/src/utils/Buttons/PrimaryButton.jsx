import PropTypes from "prop-types";

const PrimaryButton = ({text, className, action}) =>{
    return(
        <button className={`flex flex-shrink-0 h-fit px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover hover:shadow-xl transition duration-300 ease-in-out ${className}`} onClick={action}>
            {text}
    </button>);
}

PrimaryButton.propTypes = {
    text: PropTypes.any.isRequired,
    className: PropTypes.string,
    action: PropTypes.func.isRequired
}

export default PrimaryButton;