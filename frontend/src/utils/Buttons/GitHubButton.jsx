import github from "../../assets/icons/github.svg"
import PropTypes from "prop-types";
const GitHubButton = ({action}) => {

    return (
        <button className="flex text-center justify-center bg-white px-6 py-2 rounded-md shadow hover:shadow-xl hover:bg-[#FEFEFE]" onClick={action}>
            <img
                src= {github}
                alt="Github Logo"
                className={"px-3"}

            />
                GitHub
        </button>
    );
}
GitHubButton.propTypes={
    action: PropTypes.func.isRequired
}
export default GitHubButton;