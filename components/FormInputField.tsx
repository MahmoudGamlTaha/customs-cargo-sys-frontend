import { memo, React } from "react";

export interface FormInputFieldProps {
  name: string;
  label: string;
  value: string | null;
  type?: string;
  required?: boolean;
  error?: string;
  minLength?: number,
  min?: number,
  id?: string,
  disabled?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const FormInputField = memo(({ disabled, min, minLength, error, name, label, value, type = 'text', required = true, onChange }: FormInputFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}{required && <span className="text-red-500">*</span>}
      </label>

      <input
        min={min}
        minLength={minLength}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`disabled:opacity-70 mt-1 w-full p-2 border rounded-md focus:ring-brand-primary focus:border-brand-primary
      dark:bg-gray-600 dark:border-gray-500
      ${error ? 'border-red-500 !focus:ring-red-500 focus:border-red-500' : ''}`}
        required={required}
        disabled={disabled}
      />

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});
