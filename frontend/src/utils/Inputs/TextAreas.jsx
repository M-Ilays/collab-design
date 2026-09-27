import { useState } from 'react';

const TextAreas = ({ id, ariaLabel, placeholder, value, onChange, error }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col mt-2">
      <textarea
        id={id}
        className={`w-full p-3 resize-none focus:outline-none bg-white text-gray-800 
          border-2 rounded-lg dark:bg-dark dark:text-gray-100
          ${error ? 'border-red-500 placeholder-red-400' : isFocused ? 'border-primary' : 'border-gray-300'}`}
        aria-label={ariaLabel}
        placeholder={error ? error : placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};

export default TextAreas;
