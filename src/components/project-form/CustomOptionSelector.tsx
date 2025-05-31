
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface CustomOptionSelectorProps {
  title: string;
  description: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  customValue: string;
  onSaveCustom: (customValue: string) => void;
  icon?: React.ReactNode;
}

const CustomOptionSelector: React.FC<CustomOptionSelectorProps> = ({
  title,
  description,
  options,
  value,
  onChange,
  customValue,
  onSaveCustom,
  icon
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handleSaveCustom = () => {
    if (customInput.trim()) {
      onSaveCustom(customInput.trim());
      setCustomInput("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {title}
      </Label>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={`Select ${title}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
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
                onKeyDown={(e) => e.key === 'Enter' && handleSaveCustom()}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleSaveCustom}
                disabled={!customInput.trim()}
              >
                <Check className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomOptionSelector;
