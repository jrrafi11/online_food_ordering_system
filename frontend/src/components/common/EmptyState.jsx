import { Button } from './Button';

export const EmptyState = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="panel-soft text-center">
      <h3 className="text-lg font-bold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
      {actionLabel && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
