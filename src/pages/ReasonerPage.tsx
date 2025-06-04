
import React from "react";
import DeepSeekReasonerPanel from "@/components/enhanced-features/DeepSeekReasonerPanel";

const ReasonerPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">DeepSeek Reasoner</span>
        </h1>
        <p className="text-muted-foreground">
          Advanced AI reasoning with chain-of-thought processing
        </p>
      </div>
      <DeepSeekReasonerPanel />
    </div>
  );
};

export default ReasonerPage;
