import google from "../../assets/icons/google.svg";
import PropTypes from "prop-types";

const GoogleButton = ({action}) =>{

    return (
        <button className="flex text-center justify-center bg-white px-6 py-2 rounded-md shadow hover:shadow-xl hover:bg-[#FEFEFE]" onClick={action}>
            <img
                src= {google}
                alt="Google Logo"
                className={"px-3"}
            />
            Google
        </button>
    );
}

GoogleButton.propTypes={
    action: PropTypes.func.isRequired
}

export default GoogleButton;