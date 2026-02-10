import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'bg-black text-white hover:bg-gray-900 focus:ring-black':
              variant === 'primary',
            'bg-white text-black border-2 border-black hover:bg-gray-100 focus:ring-black':
              variant === 'secondary',
            'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white focus:ring-black':
              variant === 'outline',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

