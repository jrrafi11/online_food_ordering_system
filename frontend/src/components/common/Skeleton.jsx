export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`panel ${className}`}>
      <div className="shimmer h-40 w-full rounded-2xl" />
      <div className="mt-4 space-y-2">
        <div className="shimmer h-4 w-1/2 rounded" />
        <div className="shimmer h-3 w-2/3 rounded" />
        <div className="shimmer mt-3 h-3 w-full rounded" />
        <div className="shimmer h-3 w-4/5 rounded" />
      </div>
    </div>
  );
};

export const SkeletonLine = ({ className = '' }) => {
  return <div className={`shimmer h-3 rounded ${className}`} />;
};
