import FeatureCard from "./FeatureCard.jsx";
import diagram from "/src/assets/icons/diagram.svg";
import requirement from "/src/assets/icons/requirement.svg";
import collaboration from "/src/assets/icons/collaboration.svg";
import file from "/src/assets/icons/file.svg";
import H2 from "../../../utils/Headings/H2.jsx";

const Features = () => {
  const featureData = [
    {
      icon: diagram,
      alt: "diagram",
      title: "Powerful Diagramming",
      description:
        "Create and customize diagrams with ease, including use case, class, activity, and communication diagrams.",
      w: 150,
      h: 100,
    },
    {
      icon: requirement,
      alt: "requirement",
      title: "Requirements Management",
      description:
        "Efficiently manage, categorize, and trace requirements throughout your project lifecycle.",
      w: 100,
      h: 100,
    },
    {
      icon: collaboration,
      alt: "collaboration",
      title: "Collaboration",
      description:
        "Work together seamlessly with editing, comments, and version control.",
      w: 70,
      h: 100,
    },
    {
      icon: file,
      alt: "file icon",
      title: "Version control",
      description:
        "Keep a history of your files and effortlessly restore earlier versions when needed.",
      w: 50,
      h: 100,
    },
  ];

  return (
    <section id={"Features"} className="py-20 text-center bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <H2 text={"Key Features"} className={"mb-10"} />
        <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-8">
          {featureData.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
