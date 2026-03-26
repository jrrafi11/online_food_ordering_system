import clsx from 'clsx';

const colorByStatus = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-sky-200 bg-sky-50 text-sky-700',
  preparing: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  picked_up: 'border-blue-200 bg-blue-50 text-blue-700',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  user: 'border-pink-200 bg-pink-50 text-pink-700',
  restaurant: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  rider: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  admin: 'border-slate-300 bg-slate-100 text-slate-700',
};

export const StatusBadge = ({ status }) => {
  const normalized = String(status || '').toLowerCase();
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
        colorByStatus[normalized] || 'border-slate-200 bg-slate-50 text-slate-700'
      )}
    >
      {normalized.replace('_', ' ')}
    </span>
  );
};
