
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Users, TrendingUp, Star } from "lucide-react";
import { PromptStats } from "@/services/api/promptService";

interface LibraryStatsProps {
  stats: PromptStats | null;
  totalPrompts?: number;
}

const LibraryStats: React.FC<LibraryStatsProps> = ({ stats, totalPrompts = 0 }) => {
  // Use fallback values if stats are not available
  const safeStats = {
    totalPrompts: stats?.totalPrompts ?? totalPrompts,
    publicPrompts: stats?.publicPrompts ?? 0,
    totalUsage: stats?.totalUsage ?? 0,
    averageRating: stats?.averageRating ?? 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Total Prompts</p>
              <p className="text-2xl font-bold">{safeStats.totalPrompts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Public Prompts</p>
              <p className="text-2xl font-bold">{safeStats.publicPrompts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Total Usage</p>
              <p className="text-2xl font-bold">{safeStats.totalUsage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Avg Rating</p>
              <p className="text-2xl font-bold">{safeStats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LibraryStats;
