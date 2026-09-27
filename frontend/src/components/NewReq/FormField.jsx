import PropTypes from "prop-types";
import H4 from "../../utils/Headings/H4.jsx";
import { useState, useRef, useEffect } from "react";
import Tag from "../../utils/Shapes/Tag.jsx";

const FormField = ({
  title,
  placeholder,
  isTagInput,
  onChange,
  error,
  value,
  id,
  ...props
}) => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // Initialize tags from value prop if it's an array
  useEffect(() => {
    if (isTagInput && Array.isArray(value)) {
      setTags(value);
    }
  }, [isTagInput, value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      const newTags = [...tags, inputValue.trim()];
      setTags(newTags);
      setInputValue("");
      onChange({ target: { value: newTags, id } });
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      onChange({ target: { value: newTags, id } });
    }
  };

  const handleTagRemove = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    onChange({ target: { value: newTags, id } });
  };

  if (!isTagInput) {
    return (
      <div className="mb-4">
        <H4 text={title} className="font-medium" />
        <input
          type="text"
          id={id}
          value={value || ""}
          placeholder={placeholder}
          className={`w-full mt-2 p-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md dark:bg-dark-50 focus:outline-none focus:border-gray-400`}
          onChange={(e) => onChange({ ...e, target: { ...e.target, id } })}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <H4 text={title} className="font-medium" />
      <div
        className={`flex flex-wrap items-center gap-1 p-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md focus-within:border-gray-400 dark:bg-dark-50 dark:text-gray-100`}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <Tag
            key={index}
            text={tag}
            index={index}
            onRemove={handleTagRemove}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent focus:outline-none"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

FormField.propTypes = {
  title: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  isTagInput: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  id: PropTypes.string,
};

export default FormField;
