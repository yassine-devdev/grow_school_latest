'use client';

import React from 'react';

// Screen Reader Only Text
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Accessible Loading State
export function AccessibleLoadingState({ 
  children, 
  isLoading = false, 
  loadingText = 'Loading content, please wait...',
  className = ''
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}) {
  return (
    <div 
      className={className}
      aria-live="polite" 
      aria-busy={isLoading}
      role={isLoading ? 'status' : undefined}
    >
      {isLoading && <ScreenReaderOnly>{loadingText}</ScreenReaderOnly>}
      {children}
    </div>
  );
}

// Accessible Error State
export function AccessibleErrorState({ 
  children, 
  error, 
  errorText,
  className = ''
}: {
  children: React.ReactNode;
  error?: Error | string | null;
  errorText?: string;
  className?: string;
}) {
  const hasError = !!error;
  const errorMessage = error 
    ? (typeof error === 'string' ? error : error.message)
    : errorText;
  
  return (
    <div 
      className={className}
      aria-live="assertive"
      role={hasError ? 'alert' : undefined}
    >
      {hasError && errorMessage && (
        <ScreenReaderOnly>
          Error: {errorMessage}
        </ScreenReaderOnly>
      )}
      {children}
    </div>
  );
}

// Accessible Form Field with States
export function AccessibleFormField({ 
  label,
  error,
  isLoading = false,
  isRequired = false,
  description,
  children,
  fieldId,
  className = ''
}: {
  label: string;
  error?: string;
  isLoading?: boolean;
  isRequired?: boolean;
  description?: string;
  children: React.ReactNode;
  fieldId: string;
  className?: string;
}) {
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-200"
      >
        {label}
        {isRequired && (
          <span className="text-red-400 ml-1" aria-label="required">
            *
          </span>
        )}
        {isLoading && (
          <span className="ml-2 text-gray-400 text-xs">
            (Loading...)
          </span>
        )}
      </label>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-gray-400"
        >
          {description}
        </p>
      )}
      
      <div
        aria-describedby={[
          description ? descriptionId : '',
          error ? errorId : ''
        ].filter(Boolean).join(' ') || undefined}
      >
        {children}
      </div>
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Accessible Status Announcer
export function StatusAnnouncer({ 
  message, 
  type = 'polite',
  isVisible = false 
}: {
  message: string;
  type?: 'polite' | 'assertive';
  isVisible?: boolean;
}) {
  return (
    <div
      aria-live={type}
      aria-atomic="true"
      className={isVisible ? 'text-sm text-gray-400' : 'sr-only'}
      role={type === 'assertive' ? 'alert' : 'status'}
    >
      {message}
    </div>
  );
}

// Accessible Progress Indicator
export function AccessibleProgress({ 
  value, 
  max = 100, 
  label,
  description,
  className = ''
}: {
  value: number;
  max?: number;
  label: string;
  description?: string;
  className?: string;
}) {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <span className="text-sm text-gray-400">{percentage}%</span>
      </div>
      
      <div 
        className="w-full bg-gray-700 rounded-full h-2"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        aria-describedby={description ? `${label}-description` : undefined}
      >
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {description && (
        <p 
          id={`${label}-description`}
          className="text-xs text-gray-400"
        >
          {description}
        </p>
      )}
      
      <ScreenReaderOnly>
        {label}: {percentage}% complete
      </ScreenReaderOnly>
    </div>
  );
}

// Accessible Button with Loading State
export function AccessibleButton({ 
  children,
  isLoading = false,
  loadingText = 'Loading...',
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}) {
  const isDisabled = disabled || isLoading;
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:text-gray-400'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-describedby={isLoading ? 'loading-status' : undefined}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          <ScreenReaderOnly id="loading-status">
            {loadingText}
          </ScreenReaderOnly>
        </>
      )}
      
      <span aria-hidden={isLoading}>
        {isLoading ? loadingText : children}
      </span>
    </button>
  );
}

// Skip Link for Keyboard Navigation
export function SkipLink({ 
  href = '#main-content', 
  children = 'Skip to main content' 
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </a>
  );
}

// Focus Trap for Modals
export function FocusTrap({ 
  children, 
  isActive = true,
  className = ''
}: {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}) {
  const trapRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (!isActive || !trapRef.current) return;
    
    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
  
  return (
    <div 
      ref={trapRef}
      className={className}
      role="dialog"
      aria-modal={isActive}
    >
      {children}
    </div>
  );
}