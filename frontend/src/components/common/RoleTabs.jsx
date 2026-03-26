import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

const tabClass = ({ isActive }) =>
  clsx(
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    isActive
      ? 'bg-brand-600 text-white shadow-sm'
      : 'border border-pink-100 bg-white text-ink-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700'
  );

export const RoleTabs = ({ items }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={tabClass} end={item.end !== false}>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
};
