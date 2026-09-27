import PropTypes from "prop-types";
import H3 from "../../../utils/Headings/H3.jsx";

const FeatureCard = ({icon, alt, title, description,w,h}) => {
    return (
        <div className="bg-gray-100 p-6 rounded-xl shadow-lg hover:shadow-2xl">
            <div className="flex justify-center items-center mb-4">
                <img src={icon} alt={alt} className={`object-contain`}  style={{ width: `${w}px`, height: `${h}px` }} />
            </div>
            <H3  text={title}/>
            <p className="text-primary-subtitle">{description}</p>
        </div>
    );
}

FeatureCard.propTypes = {
    icon: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired
}

export default FeatureCard;
