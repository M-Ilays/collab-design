import React, { useEffect, useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";

const MediaViewer = ({
  files = [],
  currentIndex,
  setCurrentIndex,
  onClose,
}) => {
  if (!files || files.length === 0) return null;

  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mediaRef = useRef(null);
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const currentFile = files[currentIndex];
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(currentFile);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(currentFile);

  // Reset zoom and position when media changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const handleMediaLoad = (e) => {
    if (e.target) {
      setNaturalDimensions({
        width: e.target.videoWidth || e.target.naturalWidth,
        height: e.target.videoHeight || e.target.naturalHeight,
      });
    }
  };

  const prev = (e) => {
    e?.stopPropagation();
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + files.length) % files.length
    );
  };

  const next = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % files.length);
  };

  const zoomIn = (e) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = (e) => {
    e?.stopPropagation();
    setScale((prev) => Math.max(prev - 0.25, 0.25));
  };

  const resetZoom = (e) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = (e) => {
    e?.stopPropagation();
    setIsFullscreen(!isFullscreen);
  };

  // Dragging logic for zoomed images
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate maximum dimensions based on viewport and media aspect ratio
  const getMaxDimensions = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = isFullscreen ? 0 : 40; // Margin for non-fullscreen mode

    if (naturalDimensions.width === 0 || naturalDimensions.height === 0) {
      return {
        width: isFullscreen ? "100vw" : "90vw",
        height: isFullscreen ? "100vh" : "90vh",
      };
    }

    const aspectRatio = naturalDimensions.width / naturalDimensions.height;
    const maxWidth = viewportWidth - margin;
    const maxHeight = viewportHeight - margin;

    // For vertical videos/images
    if (aspectRatio < 1) {
      return {
        width: `${maxHeight * aspectRatio}px`,
        height: `${maxHeight}px`,
      };
    }
    // For horizontal videos/images
    else {
      return {
        width: `${maxWidth}px`,
        height: `${maxWidth / aspectRatio}px`,
      };
    }
  };

  const maxDimensions = getMaxDimensions();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") prev(e);
      else if (e.key === "ArrowRight") next(e);
      else if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") zoomIn(e);
      else if (e.key === "-") zoomOut(e);
      else if (e.key === "0") resetZoom(e);
      else if (e.key === "f") toggleFullscreen(e);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [files.length, scale, isDragging]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-black/90 dark:bg-black/95 flex items-center justify-center ${
        isDragging ? "cursor-grabbing" : "cursor-default"
      }`}
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left Arrow */}
      <button
        onClick={prev}
        className="absolute left-4 text-white dark:text-gray-200 text-4xl p-2 bg-black/40 dark:bg-gray-800/60 rounded-full hover:bg-black/60 hover:dark:bg-gray-800/95 transition z-10"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Media Container */}
      <div
        className={`relative ${
          isFullscreen ? "w-screen h-screen" : "max-w-[90vw] max-h-[90vh]"
        }`}
        style={{
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.2s ease",
            transformOrigin: "center center",
            width: maxDimensions.width,
            height: maxDimensions.height,
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
          ref={mediaRef}
        >
          {isVideo ? (
            <video
              controls
              autoPlay
              className="w-full h-full object-contain"
              onLoadedMetadata={handleMediaLoad}
            >
              <source src={currentFile} type="video/mp4" />
            </video>
          ) : (
            <img
              src={currentFile}
              alt={`media-${currentIndex}`}
              className="w-full h-full object-contain"
              onLoad={handleMediaLoad}
            />
          )}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={next}
        className="absolute right-4 text-white dark:text-gray-200 hover:dark:bg-gray-800/95 text-4xl p-2 bg-black/40 dark:bg-gray-800/60 rounded-full hover:bg-black/60 transition z-10"
      >
        <ChevronRight size={32} />
      </button>

      {/* Controls Bar */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
        {isImage && (
          <>
            <button
              onClick={zoomIn}
              className="text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
              title="Zoom In (+)"
            >
              <ZoomIn size={24} />
            </button>
            <button
              onClick={zoomOut}
              className="text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
              title="Zoom Out (-)"
            >
              <ZoomOut size={24} />
            </button>
            <button
              onClick={resetZoom}
              className="text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
              title="Reset Zoom (0)"
            >
              {scale.toFixed(1)}x
            </button>
          </>
        )}
        <button
          onClick={toggleFullscreen}
          className="text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
          title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
        >
          {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-red-400 dark:hover:text-red-600 transition-colors duration-200 dark:text-gray-200 p-2 bg-black/50 dark:bg-gray-800/70 rounded-full hover:bg-black/70 z-10"
        title="Close (Esc)"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default MediaViewer;
