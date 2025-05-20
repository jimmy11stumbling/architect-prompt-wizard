
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextAreaFieldProps {
  label: string;
  icon?: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  minHeight?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChange,
  required = false,
  className = "min-h-[80px]",
  minHeight,
}) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1 text-sm font-medium">
        {icon}
        {label}
      </label>
      <Textarea 
        placeholder={placeholder}
        className={className}
        style={minHeight ? { minHeight } : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
};

export default TextAreaField;
