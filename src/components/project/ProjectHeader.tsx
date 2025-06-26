import React from "react";
const ProjectHeader: React.FC = () => {
  return <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-4 mb-4">
        <img src="/lovable-uploads/0b601e77-6a17-4bff-ab47-fcf8bdb6e879.png" alt="NoCodeLos Logo" className="h-64 w-64 object-contain" />
        <h1 className="text-4xl font-bold">
          
        </h1>
      </div>
      <h2 className="text-2xl font-semibold mb-4 text-blue-300">
        Intelligent Prompt Architect
      </h2>
      <p className="text-lg text-slate-300 max-w-3xl mx-auto">Generate sophisticated AI prompts for building full-stack applications with Agent-to-Agent communication, RAG 2.0, and MCP integration</p>
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-400/30">
          DeepSeek Powered
        </div>
        <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-400/30">
          RAG 2.0 Enhanced
        </div>
        <div className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-400/30">
          AI Agent Ready
        </div>
      </div>
    </div>;
};
export default ProjectHeader;