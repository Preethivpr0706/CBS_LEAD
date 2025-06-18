//components/ui/switch.tsx
import React, { forwardRef } from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', label, description, checked = false, disabled, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    const isChecked = Boolean(checked);

    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={props.id || props.name}
              className="text-sm font-medium text-gray-700"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            ref={ref}
            checked={isChecked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only"
            aria-label={label}
            {...props}
          />
          <div 
            className={`
              w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out
              ${isChecked ? 'bg-blue-600' : 'bg-gray-200'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${className}
            `}
            onClick={() => {
              if (!disabled && onCheckedChange) {
                onCheckedChange(!isChecked);
              }
            }}
            role="switch"
            aria-checked={isChecked}
          >
            <div 
              className={`
                h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out
                ${isChecked ? 'translate-x-5' : 'translate-x-0'}
              `}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    );
  }
);

Switch.displayName = 'Switch';