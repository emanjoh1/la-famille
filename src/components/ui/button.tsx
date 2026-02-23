'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

const buttonVariants = {
  variant: {
    default:
      'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-sm',
    outline:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
    ghost:
      'text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700',
    destructive:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    link: 'text-rose-500 underline-offset-4 hover:underline p-0 h-auto',
  },
  size: {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
  },
} as const

type ButtonVariant = keyof typeof buttonVariants.variant
type ButtonSize = keyof typeof buttonVariants.size

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  asChild?: boolean
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      loading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const classes = cn(
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
      'dark:focus-visible:ring-offset-gray-900',
      'disabled:pointer-events-none disabled:opacity-50',
      buttonVariants.variant[variant],
      variant !== 'link' && buttonVariants.size[size],
      className
    )

    if (asChild) {
      return (
        <span className={classes} ref={ref as React.Ref<HTMLSpanElement>}>
          {children}
        </span>
      )
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
export type { ButtonVariant, ButtonSize }
