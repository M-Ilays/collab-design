import Tab from "./Tab";
import H1 from "../../../utils/Headings/H1";
import { IoFilterCircleOutline } from "react-icons/io5";
import PrimaryDropDown from "../../../utils/Menus/PrimaryDropDown";
const Tabs = ({ activeTab, switchTab, tabOptions }) => {
  // Prepare menu items for the dropdown
  const dropdownMenuItems = tabOptions.map((tabName) => ({
    label: tabName,
    onClick: () => switchTab(tabName),
  }));

  return (
    <section className="bg-transparent md:bg-white md:dark:bg-dark-50 dark:bg-transparent my-5 rounded-md">
      {/* Desktop Tabs */}
      <div className="hidden md:flex justify-between">
        {tabOptions.map((tabName) => (
          <Tab
            key={tabName}
            isActive={tabName === activeTab}
            switchTab={() => switchTab(tabName)}
          >
            {tabName}
          </Tab>
        ))}
      </div>

      {/* Mobile Filter Dropdown */}
      <div className="md:hidden flex justify-between items-center relative">
        <H1 Text={activeTab} TextSize={"text-lg"} />
        <PrimaryDropDown
          trigger={<IoFilterCircleOutline size={24} color="#764BA2" />}
          menuItems={dropdownMenuItems}
          align="right"
        />
      </div>
    </section>
  );
};

export default Tabs;
