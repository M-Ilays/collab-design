import PropTypes from "prop-types";
import {motion} from "framer-motion";

const AccordianItem = ({ index, question, answer, isActive, onToggle }) =>{

    return(
        <div className={` rounded-lg shadow-md overflow-hidden border border-primary mx-2`}>
            <div
                className={`text-primary-heading px-4 py-3 cursor-pointer ${isActive ? 'bg-primary text-white' : 'bg-white'}`}
                onClick={() => onToggle(index)}
            >
                <h3 className="text-lg font-medium">{question}</h3>
            </div>

            <motion.div
                initial={false}
                animate={{height: isActive ? "auto" : 0}}
                transition={{duration: 0.3, ease: "easeInOut"}}
                className="overflow-hidden"
            >
                <div className="text-primary-subtitle p-4">
                    <p>{answer}</p>
                </div>
            </motion.div>

</div>
)
};

AccordianItem.propTypes = {
    index: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired
}


export default AccordianItem;
