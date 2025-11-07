"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  className = "",
  disabled = false,
  placeholder = "Select options...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (buttonRef.current) {
      setDropdownWidth(buttonRef.current.offsetWidth);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        ref={buttonRef}
        className={`flex items-center justify-between px-3 py-2 min-h-[42px]
          rounded-lg bg-white border border-gray-200
          transition-all duration-200 cursor-pointer 
          hover:border-gray-300 focus:ring-2 focus:ring-blue-100 
          ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {value.length === 0 ? (
            <span className="text-sm text-gray-400">{placeholder}</span>
          ) : (
            selectedLabels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
              >
                {label}
                <X
                  size={14}
                  className="cursor-pointer hover:text-blue-900"
                  onClick={(e) => handleRemove(value[index], e)}
                />
              </span>
            ))
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-400 ml-2 flex-shrink-0" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-10 overflow-hidden"
            style={{ width: dropdownWidth || "auto" }}
          >
            <ul className="max-h-60 overflow-auto py-1">
              {options.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500 italic">
                  No options available
                </li>
              ) : (
                options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <li
                      key={option.value}
                      className={`px-3 py-2 text-sm transition-colors duration-150
                        cursor-pointer hover:bg-gray-50 flex items-center justify-between
                        ${
                          isSelected
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }`}
                      onClick={() => handleToggle(option.value)}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={16} className="text-blue-600" />}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelect;
