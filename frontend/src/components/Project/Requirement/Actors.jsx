import PropTypes from "prop-types";
import Pill from "../../../utils/Shapes/Pill.jsx";

const Actors = ({ title, actors }) => {
    const colors = [
        "bg-blue-200 text-blue-800",
        "bg-green-200 text-green-800",
        "bg-indigo-200 text-indigo-800",
        "bg-yellow-200 text-yellow-800",
        "bg-gray-200 text-gray-700"
    ];
    return (
        <div>
            <div className="text-lg font-bold text-gray-700 my-2 dark:text-gray-100">{title}</div>
            <div className={"flex flex-wrap gap-2 mt-2"}>
            {actors && actors.map((actor, index) => (
                    <Pill
                        key={index}
                        Text={actor}
                        className={`${colors[index % colors.length]}`}
                    />
                ))}
            </div>
        </div>
    );
};

Actors.propTypes = {
    title: PropTypes.string.isRequired,
    actors: PropTypes.array.isRequired,
};

export default Actors;
