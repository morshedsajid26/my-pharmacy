"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, X, Search } from "lucide-react";

const Dropdown = ({
  label = "",
  placeholder = "",
  options = [],
  onSelect,
  className = "",
  inputClass = "",
  optionClass = "",
  labelClass = "",
  icon = "",
  value,
  searchable = true,
  ..._props
}) => {
  const [selected, setSelected] = useState(value || "");
  const [prevValue, setPrevValue] = useState(value);
  const [searchQuery, setSearchQuery] = useState(null);
  const [show, setShow] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Sync external value changes
  if (value !== prevValue) {
    setPrevValue(value);
    setSelected(value || "");
    setSearchQuery(null);
  }

  const getDisplayValue = () => {
    if (selected === undefined || selected === null || selected === "") return "";
    const option = options.find(
      (opt) => (typeof opt === "object" ? opt.value : opt) === selected
    );
    if (option) {
      return typeof option === "object" ? option.label : String(option);
    }
    return String(selected);
  };

  const handleSelect = (val) => {
    if (val === undefined || val === null) return;
    setSelected(val);
    setSearchQuery(null);
    setShow(false);
    if (onSelect) onSelect(val);
  };

  // Filter options based on user search query
  const filteredOptions = useMemo(() => {
    if (!searchable || searchQuery === null || !searchQuery.trim()) {
      return options;
    }
    const q = searchQuery.toLowerCase().trim();
    return options.filter((item) => {
      const itemLabel = typeof item === "object" ? item.label : String(item);
      const itemValue = typeof item === "object" ? item.value : String(item);
      // Keep '+ Add New' and action items always accessible
      if (itemValue === "new") return true;
      return itemLabel.toLowerCase().includes(q);
    });
  }, [options, searchQuery, searchable]);

  // Selectable options (excludes disabled headers)
  const selectableOptions = useMemo(() => {
    return filteredOptions.filter(
      (opt) => !(typeof opt === "object" && opt.disabled)
    );
  }, [filteredOptions]);

  // Reset highlighted index when search query changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Handle outside clicks to close and reset temporary search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
        setSearchQuery(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!show) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setShow(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next < selectableOptions.length ? next : 0;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next >= 0 ? next : selectableOptions.length - 1;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectableOptions.length > 0 && selectableOptions[highlightedIndex]) {
        const opt = selectableOptions[highlightedIndex];
        const val = typeof opt === "object" ? opt.value : opt;
        handleSelect(val);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShow(false);
      setSearchQuery(null);
      inputRef.current?.blur();
    }
  };

  const inputValue = searchQuery !== null ? searchQuery : getDisplayValue();

  return (
    <div
      ref={dropdownRef}
      className={`flex flex-col gap-1.5 relative font-inter ${className}`}
      style={{ zIndex: show ? 60 : "auto" }}
      {..._props}
    >
      {/* Label */}
      {label && (
        <label className={`text-sm font-medium text-slate-700 ${labelClass}`}>
          {label}
        </label>
      )}

      {/* Input Box */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            readOnly={!searchable}
            value={inputValue}
            onChange={(e) => {
              if (!searchable) return;
              setSearchQuery(e.target.value);
              if (!show) setShow(true);
            }}
            onFocus={(e) => {
              if (!show) setShow(true);
              if (searchable) {
                e.target.select();
              }
            }}
            onClick={() => {
              if (!show) setShow(true);
            }}
            onKeyDown={handleKeyDown}
            className={`w-full bg-white border border-slate-200 outline-none px-3 pr-8 h-10 text-sm text-slate-900 rounded-lg placeholder:text-slate-400 transition-all focus:border-medical-blue-500 focus:ring-2 focus:ring-medical-blue-500/20 ${
              searchable ? "cursor-text" : "cursor-pointer"
            } ${inputClass}`}
            placeholder={placeholder}
          />

          {/* Action Icons: Clear (X) or Caret (Arrow) */}
          <div className="absolute top-1/2 -translate-y-1/2 right-2.5 flex items-center gap-1 text-slate-400">
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
                className="p-1 hover:text-slate-600 rounded transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShow(!show);
                if (!show) {
                  inputRef.current?.focus();
                }
              }}
              className={`p-1 hover:text-slate-600 transition-transform duration-200 cursor-pointer ${
                show ? "rotate-180" : ""
              } ${icon}`}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu Popup */}
        <div
          className={`absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl shadow-slate-200/50 text-slate-700 z-50 transition-all duration-150 overflow-hidden ${optionClass} ${
            show
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-1 invisible pointer-events-none"
          }`}
        >
          <div className="max-h-60 overflow-y-auto hide-scrollbar divide-y divide-slate-50">
            {/* Real-time search counter / helper when user is searching */}
            {searchQuery && (
              <div className="px-3.5 py-1.5 bg-slate-50 text-[11px] font-medium text-slate-500 flex items-center justify-between border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Search size={12} className="text-slate-400" />
                  <span>Searching: &ldquo;{searchQuery}&rdquo;</span>
                </span>
                <span className="font-mono text-slate-400">
                  {selectableOptions.length} found
                </span>
              </div>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, index) => {
                const itemLabel =
                  typeof item === "object" ? item.label : String(item);
                const itemValue =
                  typeof item === "object" ? item.value : String(item);
                const itemDisabled =
                  typeof item === "object" && Boolean(item.disabled);

                const isSelected = selected === itemValue;
                const isHighlighted =
                  selectableOptions[highlightedIndex] &&
                  (typeof selectableOptions[highlightedIndex] === "object"
                    ? selectableOptions[highlightedIndex].value
                    : selectableOptions[highlightedIndex]) === itemValue;

                if (itemDisabled) {
                  return (
                    <div
                      key={index}
                      className="py-2.5 px-4 text-xs font-semibold text-slate-400 bg-slate-50/60 cursor-default select-none"
                    >
                      {itemLabel}
                    </div>
                  );
                }

                const isNewAction = itemValue === "new";

                return (
                  <div
                    key={index}
                    onClick={() => handleSelect(itemValue)}
                    className={`py-2 px-3.5 cursor-pointer transition-colors text-sm flex items-center justify-between ${
                      isNewAction
                        ? "text-medical-blue-600 font-bold bg-medical-blue-50/40 hover:bg-medical-blue-50"
                        : isSelected
                          ? "bg-medical-blue-50 text-medical-blue-700 font-semibold"
                          : isHighlighted
                            ? "bg-slate-100/80 text-slate-900"
                            : "hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate pr-2">{itemLabel}</span>
                    {isSelected && !isNewAction && (
                      <span className="w-1.5 h-1.5 rounded-full bg-medical-blue-600 shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-4 px-4 text-center text-xs text-slate-400 italic">
                No matching results found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
