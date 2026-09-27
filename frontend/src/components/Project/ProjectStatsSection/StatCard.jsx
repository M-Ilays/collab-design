import React from "react";

const StatCard = ({ title, value, icon, bg }) => {
  return (
    <div className="bg-gray-50 text-black dark:bg-dark-50 dark:text-white p-4 flex rounded-lg shadow items-center gap-2">
      <div
        className="text-xl px-2 py-2 rounded-md"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
