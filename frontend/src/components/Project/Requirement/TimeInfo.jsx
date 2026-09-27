import PropTypes from "prop-types";

const TimeInfo = ({updatedDate, createdDate}) => {
    return (
        <div className="flex flex-col text-sm gap-2">
            <div className="flex gap-2.5">
                <div className="text-primary-subtitle dark:text-gray-400">Updated at:</div>
                <div className="text-primary-subtitle dark:text-gray-400">{updatedDate}</div>
            </div>
            <div className="flex gap-2.5">
                <div className="text-primary-subtitle dark:text-gray-400">Created at:</div>
                <div className="text-primary-subtitle dark:text-gray-400">{createdDate}</div>
            </div>
        </div>
    );
}

TimeInfo.propTypes = {
    updatedDate: PropTypes.string.isRequired,
    createdDate : PropTypes.string.isRequired

}
export default TimeInfo;