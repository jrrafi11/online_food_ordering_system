import { Button } from './Button';

export const Banner = ({ title, subtitle, ctaLabel, onCta }) => {
  return (
    <div className="panel brand-gradient relative overflow-hidden text-white">
      <div className="pointer-events-none absolute -right-20 -top-16 h-52 w-52 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="badge border-white/20 bg-white/15 text-white">Trending Offer</p>
          <h3 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h3>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-white/85">{subtitle}</p>}
        </div>
        {ctaLabel && (
          <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={onCta}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
