import clsx from 'clsx';

export const Card = ({ children, className }) => {
  return <div className={clsx('panel', className)}>{children}</div>;
};
