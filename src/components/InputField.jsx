import React from 'react'

const InputField = ({
  label,
  className,
  placeholder,
  inputClass,
  labelClass,
  value,
  onChange,
  type,
  readonly = false,
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full gap-1.5 font-inter ${className}`}>
      <label className={`text-sm font-medium text-slate-700 ${labelClass}`}>
        {label}
      </label>

      <input
        readOnly={readonly}
        type={type}
        placeholder={placeholder}
        value={value}           
        onChange={onChange}     
        className={`bg-white border border-slate-200 outline-none p-3 text-slate-900 placeholder:text-slate-400 rounded-lg transition-all focus:border-medical-blue-500 focus:ring-2 focus:ring-medical-blue-500/20 ${inputClass}`}
        {...props}
      />
    </div>
  );
}

export default InputField;

{/* <InputField                 
                // readOnly={true}
                inputClass={`rounded-lg`}
                label={`Question 3`}
                placeholder={`What's your timeline for getting started?`}
              /> */}