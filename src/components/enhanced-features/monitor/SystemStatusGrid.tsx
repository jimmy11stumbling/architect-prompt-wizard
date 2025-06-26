
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Network, Settings, Brain } from "lucide-react";

interface SystemService {
  name: string;
  status: 'active' | 'inactive';
  icon: string;
  color: string;
}

interface SystemStatusGridProps {
  services: SystemService[];
}

const SystemStatusGrid: React.FC<SystemStatusGridProps> = ({ services }) => {
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "Database": return Database;
      case "Network": return Network;
      case "Settings": return Settings;
      case "Brain": return Brain;
      default: return Database;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Services Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => {
            const ServiceIcon = getServiceIcon(service.icon);
            return (
              <div key={service.name} className="flex items-center gap-2 p-2 border rounded">
                <ServiceIcon className={`h-4 w-4 ${service.color}`} />
                <span className="text-sm font-medium">{service.name}</span>
                <div className={`w-2 h-2 rounded-full ${service.status === 'active' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusGrid;
