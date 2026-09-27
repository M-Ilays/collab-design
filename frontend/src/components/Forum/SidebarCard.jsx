import React from "react";
import { FaLink, FaRegStar } from "react-icons/fa";
import { FaCircleDot } from "react-icons/fa6";

const SidebarCard = () => {
  const mustReadPosts = [
    {
      icon: <FaCircleDot size={12} />,
      text: "Please read rules before you start working on a platform",
    },
    { icon: <FaCircleDot size={12} />, text: "Vision & Strategy of Alemhelp" },
  ];

  const featuredLinks = [
    { icon: <FaCircleDot size={12} />, text: "Alemhelp source-code on GitHub" },
    { icon: <FaCircleDot size={12} />, text: "Golang best-practices" },
    { icon: <FaCircleDot size={12} />, text: "Alem.School dashboard" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 h-fit">
      <div>
        <h4 className="font-medium mb-2 flex items-center text-black">
          <FaRegStar size={20} className="mr-2 text-gray-500" /> Must-read posts
        </h4>
        <ul className="space-y-2">
          {mustReadPosts.map((item, index) => (
            <li
              key={index}
              className="flex items-baseline gap-2 text-[#1682FD] cursor-pointer"
            >
              {item.icon} {item.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h4 className="font-medium mb-2 flex items-center text-black">
          <FaLink size={18} className="mr-3 text-gray-500" /> Featured Links
        </h4>
        <ul className="space-y-2">
          {featuredLinks.map((item, index) => (
            <li
              key={index}
              className="flex items-baseline gap-2 text-[#1682FD] cursor-pointer"
            >
              {item.icon} {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SidebarCard;
