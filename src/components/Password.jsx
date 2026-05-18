"use client";
import React, { useState } from "react";
import { FaRegEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";

const Password = ({
  label,
  placeholder,
  className = "",
  labelClass = "",
  icon = "",
  inputClass = "",
  value,
  onChange,
  name, // optional: "password" or "password_confirmation"
  readonly = false,
  ...props
}) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 w-full font-inter ${className}`}>
      {label && (
        <label className={`text-sm font-medium text-slate-700 ${labelClass}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <input
          name={name}
          type={showPass ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readonly}
          className={`w-full bg-white border border-slate-200 outline-none p-3 text-slate-900 placeholder:text-slate-400 rounded-lg transition-all focus:border-medical-blue-500 focus:ring-2 focus:ring-medical-blue-500/20 ${inputClass}`}
          aria-label={label || "password"}
          autoComplete={name === "password" ? "new-password" : "off"}
          {...props}
        />

        {!readonly && (
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            aria-pressed={showPass}
            aria-label={showPass ? "Hide password" : "Show password"}
            className={`w-8 h-8 flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-2 text-slate-400 hover:text-medical-blue-600 transition-colors ${icon}`}
          >
            {showPass ? <IoEyeOutline className="w-5 h-5" /> : <FaRegEyeSlash className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Password;