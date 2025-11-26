import React from 'react';

interface ToggleButtonProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({ label, checked, onChange, icon }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        relative flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all duration-200
        ${checked 
          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {icon && <span className={checked ? 'text-blue-500' : 'text-slate-400'}>{icon}</span>}
        <span className="font-medium text-sm md:text-base">{label}</span>
      </div>
      
      <div className={`
        w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1
        ${checked ? 'bg-blue-500' : 'bg-slate-300'}
      `}>
        <div className={`
          w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-0'}
        `} />
      </div>
    </button>
  );
};
