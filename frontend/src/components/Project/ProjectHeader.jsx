import { IoMdSettings } from "react-icons/io";
import { FaShareAlt } from "react-icons/fa";
import PrimaryButton from "../../utils/Buttons/PrimaryButton";
import H1 from "../../utils/Headings/H1.jsx";
import Pill from "../../utils/Shapes/Pill";
import HeaderIcons from "../HeaderIcons.jsx";
import Back from "../../contexts/Back.jsx";

const ProjectHeader = ({
  projectName,
  projectStatus,
  selectedVersion,
  resetVersion,
  handleRestoreVersion,
}) => {
  const getPillColor = () => {
    switch (projectStatus) {
      case "Active":
        return "green";
      case "Archived":
        return "red";
      case "Completed":
        return "yellow";
      default:
        return "gray";
    }
  };
  return (
    <>
      <header className="flex justify-between items-center px-5 sm:px-8 py-4 dark:bg-dark">
        <div className="flex gap-2 items-center">
          <Back />
          <H1
            Text={
              !selectedVersion
                ? projectName
                : projectName + " (" + selectedVersion?.name + ")"
            }
            className={"text-sm text-wrap sm:text-base md:text-2xl w-fit"}
          />
          <Pill Text={projectStatus} Color={getPillColor()} />
        </div>
        <div className="flex items-center space-x-5 ">
          <HeaderIcons />
        </div>
      </header>
      {selectedVersion && (
        <div className="dark:bg-dark px-5 pb-4 flex gap-2 ">
          <PrimaryButton
            text={"Return to current version"}
            className={" text-xs md:text-base"}
            action={resetVersion}
          />
          <PrimaryButton
            text={"Restore " + selectedVersion?.name}
            className={" text-xs md:text-base"}
            action={handleRestoreVersion}
          />
        </div>
      )}
    </>
  );
};

export default ProjectHeader;
