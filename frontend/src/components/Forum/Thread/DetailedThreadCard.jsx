import React, { useState, useEffect } from "react";
import { ThumbsUp, Paperclip, X, FileText, File } from "lucide-react";
import { BACKEND_URL } from "../../../constants/BACKEND";
import * as mammoth from 'mammoth';
// import * as SheetJS from 'xlsx';

const DetailedThreadCard = ({ thread, handleUpvote, upvoteOption, upvoted }) => {
  const [showViewer, setShowViewer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [docxContent, setDocxContent] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const openAttachmentViewer = (index) => {
    setCurrentIndex(index);
    setShowViewer(true);
    
    // Reset document-specific states
    setDocxContent(null);
    setPdfUrl(null);
    
    // Process file if it's a document type
    const file = thread.files[index];
    const fileUrl = file.startsWith("http") ? file : `${BACKEND_URL}/${file}`;
    
    if (file.toLowerCase().endsWith('.docx')) {
      handleDocxFile(fileUrl);
    } else if (file.toLowerCase().endsWith('.pdf')) {
      setPdfUrl(fileUrl);
    }
  };

  const handleDocxFile = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      // Use mammoth to convert DOCX to HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocxContent(result.value);
    } catch (error) {
      console.error("Error processing DOCX file:", error);
      setDocxContent(`<p class="text-red-500">Error loading DOCX file: ${error.message}</p>`);
    }
  };

  const closeViewer = () => {
    setShowViewer(false);
    setDocxContent(null);
    setPdfUrl(null);
  };

  // Determine file type icon and preview
  const getFileTypeInfo = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return { icon: <FileText size={24} className="text-red-500" />, type: "PDF Document" };
      case 'docx':
        return { icon: <FileText size={24} className="text-blue-500" />, type: "Word Document" };
      case 'xlsx':
      case 'xls':
        return { icon: <FileText size={24} className="text-green-500" />, type: "Excel Spreadsheet" };
      case 'mp4':
      case 'webm':
      case 'mov':
        return { icon: <File size={24} className="text-purple-500" />, type: "Video" };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return { icon: <File size={24} className="text-amber-500" />, type: "Image" };
      default:
        return { icon: <File size={24} className="text-gray-500" />, type: "File" };
    }
  };

  // Format the date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Status pill component
  const StatusPill = ({ status }) => {
    const bgColor = status === "active" 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${bgColor}`}>
        {status}
      </span>
    );
  };

  // Enhanced Media and Document Viewer component
  const MediaViewer = ({ files, currentIndex, setCurrentIndex, onClose }) => {
    const handlePrev = () => {
      setCurrentIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
    };

    const handleNext = () => {
      setCurrentIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
    };

    const currentFile = files[currentIndex];
    const fileUrl = currentFile.startsWith("http") ? currentFile : `${BACKEND_URL}/${currentFile}`;
    const fileExtension = currentFile.split('.').pop().toLowerCase();
    
    const isVideo = ["mp4", "webm", "mov"].includes(fileExtension);
    const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);
    const isPdf = fileExtension === "pdf";
    const isDocx = fileExtension === "docx";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="relative w-full max-w-4xl p-4 max-h-[90vh]">
        <button
  onClick={onClose}
  className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 dark:bg-white dark:text-black hover:dark:bg-opacity-70 z-10"
>

            <X size={24} />
          </button>
          
          <div className="flex justify-center items-center h-full overflow-auto bg-white dark:bg-gray-800 rounded-lg p-4">
            {isVideo ? (
              <video controls autoPlay className="max-h-[70vh] max-w-full">
                <source src={fileUrl} type="video/mp4" />
              </video>
            ) : isImage ? (
              <img
                src={fileUrl}
                alt={`Media ${currentIndex + 1}`}
                className="max-h-[70vh] max-w-full object-contain"
              />
            ) : isPdf ? (
              <div className="w-full h-[70vh]">
                <iframe 
                  src={pdfUrl} 
                  className="w-full h-full border-0" 
                  title="PDF Viewer"
                />
              </div>
            ) : isDocx ? (
              <div className="w-full h-[70vh] overflow-auto p-6 bg-white text-black">
                {docxContent ? (
                  <div dangerouslySetInnerHTML={{ __html: docxContent }} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse flex flex-col items-center">
                      <FileText size={48} className="text-blue-500 mb-4" />
                      <p className="text-gray-700">Loading document...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <FileText size={64} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentFile.split('/').pop()}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  This file type can't be previewed
                </p>
                <a 
                  href={fileUrl} 
                  download
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download File
                </a>
              </div>
            )}
          </div>

          {files.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              <button
                onClick={handlePrev}
                className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-70 transition-all"
              >
                Previous
              </button>
              <span className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                {currentIndex + 1} / {files.length}
              </span>
              <button
                onClick={handleNext}
                className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-70 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // File thumbnail component
  const FileThumbnail = ({ file, index, isLast, remainingCount }) => {
    const fileUrl = file.startsWith("http") ? file : `${BACKEND_URL}/${file}`;
    const fileName = file.split('/').pop();
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    const isVideo = ["mp4", "webm", "mov"].includes(fileExtension);
    const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);
    const { icon, type } = getFileTypeInfo(fileName);
    
    return (
      <div
        onClick={() => openAttachmentViewer(index)}
        className="relative cursor-pointer rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video group"
      >
        {isVideo ? (
          <video className="w-full h-full object-cover" muted>
            <source src={fileUrl} type="video/mp4" />
          </video>
        ) : isImage ? (
          <img
            src={fileUrl}
            alt={`attachment-${index}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="mb-2">
              {icon}
            </div>
            <p className="text-xs text-center font-medium text-gray-700 dark:text-gray-300 truncate max-w-full">
              {fileName}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {type}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
          {isLast && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white font-medium">
              +{remainingCount} more
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!thread) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
            {thread.author?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              @{thread.author?.name || "Unknown"}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(thread.createdAt)}
            </p>
          </div>
        </div>
        <StatusPill status={thread.status || "active"} />
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        {thread.title}
      </h2>
      
      <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
        {thread.content}
      </p>

      {/* Files/Attachments Section */}
      {thread.files && thread.files.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Paperclip size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Attachments ({thread.files.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {thread.files.slice(0, 3).map((file, index) => {
              const isLast = index === 2 && thread.files.length > 3;
              const remainingCount = thread.files.length - 3;
              
              return (
                <FileThumbnail 
                  key={index}
                  file={file}
                  index={index}
                  isLast={isLast}
                  remainingCount={remainingCount}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Media Viewer */}
      {showViewer && (
        <MediaViewer
          files={thread.files}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onClose={closeViewer}
        />
      )}

      {/* Tags Section */}
      {thread.tags && thread.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {thread.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-sm px-3 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Upvote Button and Stats */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <ThumbsUp size={16} fill={ upvoted ? "#764BA2" : "none"} color={upvoted ? "#764BA2" : undefined} />
            <span>{thread?.likes?.length || 0} likes</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{thread?.comments?.length || 0} comments</span>
          </div>
        </div>
        {upvoteOption && (
          <button
            onClick={handleUpvote}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors duration-200"
          >
            <ThumbsUp size={18} fill={upvoted ? "#fff" : "none"} color={upvoted ? "#fff" : undefined} />
            <span>{upvoted ? "Upvoted" : "Upvote"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DetailedThreadCard;