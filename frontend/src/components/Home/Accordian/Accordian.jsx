import { useState } from 'react';
import AccordianItem from './AccordianItem.jsx';
import H2 from '../../../utils/Headings/H2.jsx';

const FAQ_DATA = [
    {
        question: "How do I start collaborating with my team?",
        answer: "After signing up, you can create a team and invite members. Once your team is set up, you can start creating and sharing diagrams and requirements instantly.",
    },
    {
        question: "What types of diagrams can I create?",
        answer: "Collab Design supports a wide range of diagrams including use case, class, activity, and communication diagrams.",
    },
    {
        question: "How does automated diagram generation work?",
        answer: "It is generated through the specified requirements of your project.",
    },
];

const Accordion = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section id="FAQ" className="container py-8 mx-auto">
            <H2 text="Frequently Asked Questions" className="mb-10 text-center px-2" />
            <div className="space-y-4">
                {FAQ_DATA.map((item, index) => (
                    <AccordianItem
                        key={index}
                        index={index}
                        question={item.question}
                        answer={item.answer}
                        isActive={activeIndex === index}
                        onToggle={toggleAccordion}
                    />
                ))}
            </div>
        </section>
    );
};

export default Accordion;
