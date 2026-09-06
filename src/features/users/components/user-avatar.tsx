import { cn } from '@/lib/utils';

type UserAvatarProps = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function UserAvatar({
  firstName,
  lastName,
  email,
  size = 'md',
  className,
}: UserAvatarProps) {
  let initials: string;
  const first = firstName?.trim();
  const last = lastName?.trim();

  if (first && last) {
    initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  } else if (first) {
    initials = first.slice(0, 2).toUpperCase();
  } else if (last) {
    initials = last.slice(0, 2).toUpperCase();
  } else if (email?.trim()) {
    initials = email.trim().charAt(0).toUpperCase();
  } else {
    initials = 'U';
  }

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg font-bold',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 select-none items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-primary/20',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
