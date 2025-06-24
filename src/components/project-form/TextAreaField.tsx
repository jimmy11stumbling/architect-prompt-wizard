
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextAreaFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minHeight?: string;
  maxLength?: number;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  required, 
  minHeight = "100px",
  maxLength
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Textarea
        id={label.toLowerCase().replace(/\s+/g, '-')}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none"
        style={{ minHeight }}
        maxLength={maxLength}
      />
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default TextAreaField;
