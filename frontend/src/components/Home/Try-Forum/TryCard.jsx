import PropTypes from "prop-types";
import PrimaryButton from "../../../utils/Buttons/PrimaryButton.jsx";
import H3 from "../../../utils/Headings/H2.jsx"

const TryCard = ({ title, description, buttonLabel, buttonAction }) => {
    return (
        <div className="bg-white shadow-md rounded-2xl p-6 text-center max-w-sm w-full border border-primary hover:shadow-2xl space-y-5 my-2 pb-10">
            <H3 text={title} className={"text-xl mb-4"}/>
            <p className="text-primary-subtitle mb-8">{description}</p>
            <PrimaryButton text={buttonLabel} action={buttonAction} className={"w-full items-center justify-center"} />
        </div>
    );
};


TryCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    buttonLabel: PropTypes.string.isRequired,
    buttonAction: PropTypes.func.isRequired,
}

export default TryCard;
