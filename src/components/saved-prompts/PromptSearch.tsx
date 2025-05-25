
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PromptSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const PromptSearch: React.FC<PromptSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search prompts..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default PromptSearch;
