import PropTypes from "prop-types";

const StatCard = ({ title, value, colour }) => {
    return (
        <div className={`flex  mx-2 p-4 sm:p-8 justify-around rounded-2xl flex-1 text-white gap-4 ${colour}`}>
            <h1 className={"text-xl font-bold w-full sm:w-2/6"}>{title}</h1>
            <h1 className={"text-4xl font-bold mx-2 lg:mx-4 mt-2"}>{value}</h1>
        </div>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    colour: PropTypes.string.isRequired,
};

export default StatCard;