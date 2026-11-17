'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      className = '',
      id,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const isPasswordField = type === 'password';
    const enablePasswordToggle = showPasswordToggle ?? isPasswordField;
    const computedType = enablePasswordToggle
      ? isPasswordVisible
        ? 'text'
        : 'password'
      : type;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-foreground tracking-wide"
          >
            {label}
            {props.required && <span className="text-rust ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={computedType}
            className={`
              w-full bg-card text-foreground text-sm rounded-sm border py-2 transition-colors duration-150 focus-ring
              ${leftIcon ? 'pl-9' : 'pl-3.5'}
              ${enablePasswordToggle || rightIcon ? 'pr-9' : 'pr-3.5'}
              ${error ? 'border-rust focus:border-rust' : 'border-card-border hover:border-card-border-hover focus:border-primary'}
              placeholder:text-muted/70 disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />

          {enablePasswordToggle ? (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(prev => !prev)}
              className="absolute right-3 text-muted hover:text-foreground transition-colors cursor-pointer p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary/40 flex items-center justify-center"
              title={isPasswordVisible ? 'Hide password' : 'Show password'}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {isPasswordVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 text-muted flex items-center justify-center">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="text-xs text-rust font-medium mt-0.5 animate-fadeIn">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
