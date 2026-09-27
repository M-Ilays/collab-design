import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const PrimaryDropDown = ({ trigger, menuItems, align = "right" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Detect clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Element */}
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-40 bg-white dark:bg-dark-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <ul>
            {menuItems.map((item, index) => (
              <li
                key={index}
                className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  item.onClick();
                  closeDropdown();
                }}
              >
                {item.icon}
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

PrimaryDropDown.propTypes = {
  trigger: PropTypes.node.isRequired, // The element that triggers the dropdown
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ).isRequired,
  align: PropTypes.oneOf(["left", "right"]),
};

export default PrimaryDropDown;
