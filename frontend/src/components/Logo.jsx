import PropTypes from "prop-types";
const Logo = ({className}) => {

    const Text = "Collab Design";
    return (
        <div className={`bg-transparent w-fit  sm:text-xl font-extrabold md:tex-lg text-md p-2 text-white ${className}`}>
            {Text}
        </div>
    );
}

Logo.propTypes = {
    className: PropTypes.string
}


export default Logo;