
import React, { useState } from "react";
import { TooltipProvider, TooltipContent, TooltipTrigger, Tooltip } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CustomOptionSelectorProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  customValue: string;
  onSaveCustom: (value: string) => void;
}

const CustomOptionSelector: React.FC<CustomOptionSelectorProps> = ({
  icon,
  title,
  description,
  options,
  value,
  onChange,
  customValue,
  onSaveCustom,
}) => {
  const [customInput, setCustomInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveCustom = () => {
    if (customInput.trim()) {
      onSaveCustom(customInput);
      setCustomInput("");
      setIsDialogOpen(false);
    }
  };

  // Handle value change - if "Custom" is selected, open dialog automatically
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "Custom") {
      setIsDialogOpen(true);
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <label className="flex items-center gap-1 text-sm font-medium">
          {icon}
          {title}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help ml-1 text-xs bg-ipa-muted/30 px-1 rounded">?</span>
            </TooltipTrigger>
            <TooltipContent className="w-64 p-3">
              <p>{description}</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <div className="flex items-center gap-2">
          <Select 
            value={value}
            onValueChange={handleValueChange}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={`Select ${title}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
              {customValue && customValue !== "Custom" && (
                <SelectItem value={customValue}>
                  {customValue}
                </SelectItem>
              )}
              <SelectItem value="Custom">Custom...</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Custom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom {title}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input 
                  placeholder={`Enter custom ${title.toLowerCase()}...`}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveCustom();
                    }
                  }}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleSaveCustom}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CustomOptionSelector;
