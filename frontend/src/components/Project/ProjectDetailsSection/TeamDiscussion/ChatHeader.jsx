import OverLappingCircles from "../../../../utils/Shapes/OverLappingCircles";
import { useTheme } from "../../../../contexts/ThemeContext";

const ChatHeader = ({ projectName, members }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="flex items-center border-b pb-3">
      <div className="relative flex bottom-5">
        {members.slice(0, 5).map((member, index) => (
          <OverLappingCircles
            key={member.id}
            text={member.name[0].toUpperCase()}
            index={index}
          />
        ))}
      </div>
      <div className="flex w-full justify-center">
        <h2
          className={`text-lg font-semibold ml-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
        >
          {"Team " + projectName}
        </h2>
      </div>
    </div>
  );
};

export default ChatHeader;
