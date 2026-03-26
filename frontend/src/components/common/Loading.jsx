import { SkeletonLine } from './Skeleton';

export const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="panel space-y-3">
      <SkeletonLine className="h-5 w-1/3" />
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-4 w-2/3" />
      <p className="text-sm text-ink-500">{text}</p>
    </div>
  );
};
