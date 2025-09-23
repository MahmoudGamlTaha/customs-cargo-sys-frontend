import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import ReactDOM from "react-dom";

// interface Option {
//   value: string;
//   label: string;
// }

interface CustomSelectProps<T> {
  options: T[];
  displayKey?: keyof T;
  valueKey?: keyof T;
  value: any;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function CustomSelect<T>({ displayKey, valueKey, options, value, onChange, placeholder, className = '' }: CustomSelectProps<T>) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const handleToggle = () => {
    if (!isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (optionValue: any) => {
    console.log(optionValue, "optionValue")
    onChange(optionValue);
    setIsOpen(false);
  };

  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const selectedOption = (options || [])?.find(option => option[valueKey as string || 'value'] === value);

  return (
    <div className={`w-full relative ${className}`} ref={selectRef}>
      <button
        type="button"
        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm ltr:pl-3 rtl:pr-3 ltr:pr-10 rtl:pl-10 py-3 ltr:text-left rtl:text-right text-gray-800 dark:text-gray-200 cursor-default focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate">{selectedOption ? selectedOption[displayKey as string || 'label'] : (placeholder || t('customSelect.placeholder'))}</span>
        <span className="absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center ltr:pr-2 rtl:pl-2 pointer-events-none">
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && ReactDOM.createPortal(
        <ul
          ref={dropdownRef}
          style={dropdownStyle}
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-44 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
          role="listbox"
        >
          {options?.map((option) => (
            <li
              key={option[valueKey as string || "value"]}
              className="text-gray-900 dark:text-gray-200 cursor-default select-none relative py-2 ltr:pl-3 rtl:pr-3 ltr:pr-9 rtl:pl-9 ltr:text-left rtl:text-right hover:bg-gray-100 dark:hover:bg-gray-700"
              role="option"
              aria-selected={option[valueKey as string || "value"] === value}
              onClick={() => handleSelectOption(option[valueKey as string || "value"])}
            >
              <span
                className={`block truncate ${option[valueKey as string || "value"] === value
                    ? "font-semibold"
                    : "font-normal"
                  }`}
              >
                {option[displayKey as string || "label"]}
              </span>
              {option[valueKey as string || "value"] === value && (
                <span className="absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center ltr:pr-4 rtl:pl-4">
                  <CheckIcon />
                </span>
              )}
            </li>
          ))}
        </ul>
        ,
        document.body
      )}
    </div>
  )
}

export default CustomSelect;