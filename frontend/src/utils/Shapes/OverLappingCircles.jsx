import React, { useState } from "react";
import Circle from "./Circle";

const OverLappingCircles = ({ text, index, ImageUrl }) => {
  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-400",
    "bg-primary",
  ];

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const value = screenWidth <= 640 ? 1 : 1.65;

  return (
    <Circle
      text={text}
      colour={colors[index % 5]} // Call the function to get a random color
      className="absolute"
      style={{ left: `${index * value}rem` }}
      ImageUrl={ImageUrl}
    />
  );
};

export default OverLappingCircles;
