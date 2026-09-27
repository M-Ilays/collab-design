import React, { useState } from "react";
import { Paperclip, X, Plus } from "lucide-react";
import ShowError from "../../overlays/ShowError";

const CreateThreadCard = ({ onSubmit }) => {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState({ show: false, message: "" });

  const closeError = () => {
    setError({ show: false, message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const content = e.target.content.value;

    if (!title.trim() || !content.trim()) {
      setError({
        show: true,
        message: "Title and Content cannot be empty",
      });
      return;
    }

    try {
      await onSubmit({ title, content, tags, files });
      e.target.reset();
      setTags([]);
      setFiles([]);
    } catch (error) {
      console.error("Error submitting thread:", error);
    }
  };

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "" && tags.length < 5) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 transition-colors duration-200">
      {error.show && <ShowError text={error.message} onClose={closeError} />}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Create New Thread
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition-colors duration-200"
            placeholder="Enter a descriptive title"
          />
        </div>

        {/* Content Input */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows="4"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition-colors duration-200"
            placeholder="Share your thoughts, questions, or ideas in detail..."
          ></textarea>
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (max 5)
          </label>
          <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-colors duration-200">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-sm px-2 py-1 rounded-md"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 text-purple-500 hover:text-purple-600 dark:text-purple-300 dark:hover:text-purple-200"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <input
              type="text"
              className="flex-1 min-w-[120px] border-none outline-none p-2 text-gray-800 dark:text-white bg-transparent text-sm focus:outline-none"
              placeholder={tags.length < 5 ? "Type and press Enter" : ""}
              value={tagInput}
              onChange={handleTagInput}
              onKeyDown={handleTagKeyDown}
              disabled={tags.length >= 5}
            />
          </div>
        </div>

        {/* File Preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm px-3 py-1 rounded-md"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-300"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button and File Upload */}
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-purple-100 dark:hover:bg-primary-hover cursor-pointer transition-colors duration-200">
            <Paperclip size={18} />
            <span className="text-sm">Attach</span>
            <input
              type="file"
              multiple
              accept="image/*, video/*, application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors duration-200"
          >
            <Plus size={18} />
            <span>Create Thread</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateThreadCard;
