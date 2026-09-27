const ShimmerCard = () => {
  return (
    <div className="min-w-[250px] bg-white border border-gray-200 rounded-lg p-4 animate-pulse shadow-md">
      <div className="h-5 bg-gray-300 rounded w-2/3 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
    </div>
  );
};

export default ShimmerCard;
