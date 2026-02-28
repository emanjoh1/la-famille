import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

const badgeVariants = {
  default: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  secondary:
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  destructive:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  outline:
    'border border-gray-300 text-gray-700 bg-transparent dark:border-gray-600 dark:text-gray-300',
} as const

type BadgeVariant = keyof typeof badgeVariants

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
export type { BadgeVariant }
