import React from "react";

const Tab = ({ children, isActive, switchTab }) => {
  return (
    <button
      onClick={switchTab}
      className={`px-6 py-4 text-sm w-full hover:transition-colors duration-200 ${
        isActive
          ? "text-white bg-primary rounded-md font-medium"
          : "text-gray-600 dark:text-gray-300 font-semibold  hover:text-primary dark:hover:text-primary"
      } ${
        !isActive
          ? "border-l border-gray-200 dark:border-gray-600 first:border-l-0"
          : ""
      }`}
    >
      {children}
    </button>
  );
};

export default Tab;
