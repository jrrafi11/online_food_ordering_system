import clsx from 'clsx';

export const Chip = ({ active = false, children, className, ...props }) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-brand-500 bg-brand-600 text-white shadow-sm'
          : 'border-pink-100 bg-white text-ink-700 hover:border-brand-200 hover:bg-brand-50',
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};
