import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      className = '',
      disabled = false,
      required = false,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
          >
            {label} {required && <span className="text-zinc-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full p-3.5 bg-zinc-900/80 text-white placeholder-zinc-500 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-white focus:border-white disabled:opacity-50 disabled:cursor-not-allowed resize-y ${
            error
              ? 'border-zinc-500 focus:ring-zinc-400 focus:border-zinc-400'
              : 'border-zinc-800 hover:border-zinc-700'
          } ${className}`}
          {...props}
        />

        {error && (
          <p id={errorId} className="text-xs text-zinc-300 font-medium">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-zinc-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
