import PropTypes from "prop-types";

const SecondaryButton = ({text, action, className}) => {

    return (
        <button
            className={`px-4 py-2 bg-gradient-to-r from-primary to-[#667Be6] font-bold text-white rounded-md hover:from-[#667Be6] hover:to-primary hover:shadow-xl transition duration-300 ease-in-out ${className}`}
            onClick={action}>
            {text}
        </button>
    );
}

SecondaryButton.propTypes = {
    text: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
    className: PropTypes.string
}

export default SecondaryButton;