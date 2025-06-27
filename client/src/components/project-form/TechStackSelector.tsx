
import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { TechStack } from "@/types/ipa-types";

interface TechStackSelectorProps {
  title: string;
  options: TechStack[];
  selectedTechs: TechStack[];
  customTechs: string[];
  onToggleTech: (tech: TechStack) => void;
  onAddCustomTech: (tech: string) => void;
  onRemoveCustomTech: (tech: string) => void;
  bgColorClass: string;
}

const TechStackSelector: React.FC<TechStackSelectorProps> = ({
  title,
  options,
  selectedTechs,
  customTechs,
  onToggleTech,
  onAddCustomTech,
  onRemoveCustomTech,
  bgColorClass,
}) => {
  const [newCustomTech, setNewCustomTech] = useState("");

  const handleAddCustomTech = () => {
    if (newCustomTech.trim() !== "" && !customTechs.includes(newCustomTech)) {
      onAddCustomTech(newCustomTech.trim());
      setNewCustomTech("");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium flex items-center justify-between">
        <span>{title}</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" /> Add Custom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom {title} Technology</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder={`Enter custom ${title.toLowerCase()} technology...`}
                value={newCustomTech}
                onChange={(e) => setNewCustomTech(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleAddCustomTech}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((tech) => (
          <Badge 
            key={tech}
            variant={selectedTechs.includes(tech) ? "default" : "outline"}
            className={`cursor-pointer ${
              selectedTechs.includes(tech) ? bgColorClass : ""
            }`}
            onClick={() => onToggleTech(tech)}
          >
            {tech}
            {selectedTechs.includes(tech) && (
              <X className="ml-1 h-3 w-3" />
            )}
          </Badge>
        ))}
        {customTechs.map((tech) => (
          <Badge 
            key={tech}
            variant="default"
            className="cursor-pointer bg-ipa-accent"
          >
            {tech}
            <X 
              className="ml-1 h-3 w-3" 
              onClick={() => onRemoveCustomTech(tech)} 
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TechStackSelector;
