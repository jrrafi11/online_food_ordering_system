import clsx from 'clsx';

export const Button = ({
  as: Component = 'button',
  variant = 'primary',
  className,
  type = 'button',
  children,
  ...props
}) => {
  const variantClass =
    variant === 'outline'
      ? 'btn-outline'
      : variant === 'ghost'
        ? 'btn-ghost'
        : 'btn-primary';

  return (
    <Component className={clsx(variantClass, className)} type={Component === 'button' ? type : undefined} {...props}>
      {children}
    </Component>
  );
};
