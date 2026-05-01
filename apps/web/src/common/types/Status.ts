export type Status = 'danger' | 'warning' | 'success';

export const statusConfig = {
  danger: {
    iconColor: 'var(--error)',
    textClass: 'text-[var(--error)]',
  },
  success: {
    iconColor: 'var(--success)',
    textClass: 'text-[var(--success)]',
  },
  warning: {
    iconColor: 'var(--warning)',
    textClass: 'text-[var(--warning)]',
  },
  info: {
    iconColor: 'var(--info)',
    textClass: 'text-[var(--info)]',
  },
} as const;
