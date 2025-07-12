import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save } from "lucide-react";

interface CustomOptionSelectorProps {
  title: string;
  description: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  customValue?: string;
  onSaveCustom?: (value: string) => void;
  placeholder?: string;
}

export const CustomOptionSelector: React.FC<CustomOptionSelectorProps> = ({
  title,
  description,
  options = [],
  value = "",
  onChange,
  customValue = "",
  onSaveCustom,
  placeholder = "Select an option"
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState(customValue);

  const handleSelectionChange = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
      onChange(selectedValue);
    }
  };

  const handleSaveCustom = () => {
    if (customInput.trim() && onSaveCustom) {
      onSaveCustom(customInput.trim());
      onChange(customInput.trim());
      setIsCustomMode(false);
    }
  };

  const allOptions = [...options, "Custom"];

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {!isCustomMode ? (
        <Select value={value} onValueChange={handleSelectionChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {allOptions.map((option) => (
              <SelectItem key={option} value={option.toLowerCase()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={`Enter custom ${title.toLowerCase()}`}
            className="flex-1"
          />
          <Button 
            size="sm" 
            onClick={handleSaveCustom}
            disabled={!customInput.trim()}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsCustomMode(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {customValue && !isCustomMode && value === customValue && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          Using custom value: {customValue}
        </div>
      )}
    </div>
  );
};

export default CustomOptionSelector;