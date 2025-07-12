
import React from "react";
import { SavedPrompt } from "@/services/api/promptService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Edit, Star, Globe, Lock, TrendingUp } from "lucide-react";
import PromptActions from "./PromptActions";

interface PromptCardProps {
  prompt: SavedPrompt;
  onDelete: (id: string | undefined) => void;
  onCopy: (prompt: string) => void;
  onDownload: (prompt: string) => void;
  onEdit?: (prompt: SavedPrompt) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  onDelete, 
  onCopy, 
  onDownload,
  onEdit 
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
      'web-apps': '🌐',
      'mobile-apps': '📱',
      'ai-ml': '🤖',
      'data-analytics': '📊',
      'automation': '⚡',
      'creative': '🎨'
    };
    return icons[category || ''] || '📝';
  };

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-ipa-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {prompt.category && (
                <span className="text-xl">{getCategoryIcon(prompt.category)}</span>
              )}
              {prompt.projectName}
              {prompt.isPublic ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
            </CardTitle>
            {prompt.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {prompt.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(prompt.timestamp)}</span>
            </div>
            {prompt.lastModified && prompt.lastModified !== prompt.timestamp && (
              <div className="flex items-center gap-1">
                <Edit className="h-3 w-3" />
                <span>Modified {formatDate(prompt.lastModified)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          {/* Prompt Preview */}
          <div className="max-h-20 overflow-hidden text-ellipsis text-sm bg-muted/30 p-2 rounded">
            {prompt.prompt?.substring(0, 200)}
            {(prompt.prompt?.length || 0) > 200 ? "..." : ""}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 items-center">
            {prompt.complexity && (
              <Badge className={`text-xs ${getComplexityColor(prompt.complexity)}`}>
                {prompt.complexity}
              </Badge>
            )}
            {prompt.estimatedTime && (
              <Badge variant="outline" className="text-xs">
                ⏱️ {prompt.estimatedTime}
              </Badge>
            )}
            {prompt.rating && prompt.rating > 0 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {prompt.rating}
              </Badge>
            )}
            {prompt.usage && prompt.usage > 0 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {prompt.usage} uses
              </Badge>
            )}
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.slice(0, 4).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {prompt.tags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{prompt.tags.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Tech Stack */}
          {prompt.techStack && prompt.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.techStack.slice(0, 3).map((tech, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {tech}
                </Badge>
              ))}
              {prompt.techStack.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{prompt.techStack.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Author */}
          {prompt.author && (
            <div className="text-xs text-muted-foreground">
              by {prompt.author}
            </div>
          )}
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-2 flex justify-between">
        <PromptActions
          prompt={prompt}
          onDelete={onDelete}
          onCopy={onCopy}
          onDownload={onDownload}
          onEdit={onEdit}
        />
      </CardFooter>
    </Card>
  );
};

export default PromptCard;
