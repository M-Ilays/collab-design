import HeaderIcons from "../HeaderIcons.jsx";
import H1 from "../../utils/Headings/H1.jsx";
import SecondaryInput from "../../utils/Inputs/SecondaryInput.jsx";
import Back from "../../contexts/Back.jsx";
import { Link } from "react-router-dom";

const DashboardHeader = ({ onSearchChange, showSearch, showBack }) => {
  return (
    <div>
      <header className="bg-white dark:bg-dark flex justify-between items-center py-5 px-2 md:px-5 pl-5 md:pl-10">
        <div className="flex gap-x-2 items-center">
          {showBack && <Back />}
          <Link to={"/dashboard"}>
            <H1 Text={"Collab Design"} TextSize={"text-base md:text-2xl"} />
          </Link>
        </div>
        <div className="flex items-center justify-center gap-5 md:pr-10 pr-2">
          {!showSearch && (
            <SecondaryInput
              placeHolder={"Search projects..."}
              className={"hidden md:flex"}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          )}
          <HeaderIcons />
        </div>
      </header>
      <div className="flex-grow border-t border-gray-300 dark:border-dark-50 mx-auto w-full md:w-[95dvw]"></div>
    </div>
  );
};

export default DashboardHeader;
