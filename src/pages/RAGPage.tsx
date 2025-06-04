
import React from "react";
import RAGQueryInterface from "@/components/rag/RAGQueryInterface";

const RAGPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">RAG Knowledge System</span>
        </h1>
        <p className="text-muted-foreground">
          Query and interact with the RAG 2.0 knowledge database
        </p>
      </div>
      <RAGQueryInterface />
    </div>
  );
};

export default RAGPage;
