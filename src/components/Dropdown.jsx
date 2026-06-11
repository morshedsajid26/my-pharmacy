"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

const Dropdown = ({
  label = "",
  placeholder = "",
  options = [],
  onSelect,
  className,
  inputClass,
  optionClass,
  labelClass,
  icon,
  value,
  _props
}) => {
  const [selected, setSelected] = useState(value || "");
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setSelected(value || "");
  }
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (val) => {
    setSelected(val);
    setShow(false);
    if (onSelect) onSelect(val);
  };

  const getDisplayValue = () => {
    if (!selected) return "";
    const option = options.find(opt => (typeof opt === 'object' ? opt.value : opt) === selected);
    if (option) {
      return typeof option === 'object' ? option.label : option;
    }
    return selected;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`flex flex-col gap-1.5 relative font-inter ${className}`}
      {..._props}
    >
      {/* Label */}
      <label className={`text-sm font-medium text-slate-700 ${labelClass}`}>
        {label}
      </label>

      {/* Input Box */}
      <div className="relative">
        <div onClick={() => setShow(!show)} className="relative">
          <input
            readOnly
            value={getDisplayValue()}
            className={`w-full bg-white border border-slate-200 outline-none px-3 h-10 text-sm text-slate-900 rounded-lg placeholder:text-slate-400 cursor-pointer transition-all focus:border-medical-blue-500 focus:ring-2 focus:ring-medical-blue-500/20 ${inputClass}`}
            placeholder={placeholder}
          />

          {/* Arrow Icon */}
          <div className={`absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 transition-transform duration-200 ${show ? 'rotate-180' : ''} ${icon}`}>
            <FaCaretDown size={18} />
          </div>
        </div>

        {/* Dropdown Menu */}
        <div
          className={`absolute left-0 top-full mt-1 w-full bg-white border border-slate-100 rounded-lg shadow-xl shadow-slate-200/50 text-slate-700 z-50 transition-all duration-200 overflow-hidden ${optionClass} ${
            show
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-2 invisible"
          }`}
        >
          <div className="max-h-60 overflow-y-auto hide-scrollbar">
            {options.map((item, index) => {
              const itemLabel = typeof item === 'object' ? item.label : item;
              const itemValue = typeof item === 'object' ? item.value : item;
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(itemValue)}
                  className={`py-2.5 px-4 hover:bg-medical-blue-50 hover:text-medical-blue-600 cursor-pointer transition-colors text-sm ${selected === itemValue ? 'bg-medical-blue-50 text-medical-blue-600 font-semibold' : ''}`}
                >
                  {itemLabel}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;




