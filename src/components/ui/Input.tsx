import React from 'react';
import { cn } from '@/lib/utils';
import { InputProps } from '@/types';

const Input: React.FC<InputProps> = ({
  className,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  disabled = false,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
          'px-3 py-2',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          disabled && 'bg-gray-50 cursor-not-allowed',
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;