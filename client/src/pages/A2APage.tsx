
import React from "react";
import A2ANetworkViewer from "@/components/a2a/A2ANetworkViewer";

const A2APage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">A2A Network Control</span>
        </h1>
        <p className="text-muted-foreground">
          Monitor and control Agent-to-Agent communication network
        </p>
      </div>
      <A2ANetworkViewer />
    </div>
  );
};

export default A2APage;
