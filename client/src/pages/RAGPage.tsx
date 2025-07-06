import { useState } from "react";
import RAG2Interface from "@/components/rag/RAG2Interface";
import RAGInterface from "@/components/rag/RAGInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Target, 
  Zap,
  TrendingUp,
  FileText,
  Clock,
  Cpu,
  Network,
  Search
} from "lucide-react";
import { RAG2Result } from "@/services/rag/ragService";

export default function RAGPage() {
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedRAG2Result, setSelectedRAG2Result] = useState<RAG2Result | null>(null);

  const handleResultSelect = (result: any) => {
    setSelectedResult(result);
    console.log('Selected RAG result:', result);
  };

  const handleRAG2ResultSelect = (result: RAG2Result) => {
    setSelectedRAG2Result(result);
    console.log('Selected RAG 2.0 result:', result);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">RAG 2.0 Vector Search System</h1>
        </div>
        <p className="text-muted-foreground">
          Production-ready retrieval-augmented generation with vector database, hybrid search, and intelligent re-ranking
        </p>
      </div>

      <Tabs defaultValue="rag2" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rag2" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            RAG 2.0 System
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Legacy RAG
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rag2" className="space-y-6">
          <RAG2Interface onResultSelect={handleRAG2ResultSelect} />
          
          {/* Selected Result Details */}
          {selectedRAG2Result && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Result Details</CardTitle>
                <CardDescription>Detailed view of the selected search result</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedRAG2Result.title}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant={
                        selectedRAG2Result.metadata.matchType === 'hybrid' ? 'default' :
                        selectedRAG2Result.metadata.matchType === 'semantic' ? 'secondary' : 'outline'
                      }>
                        {selectedRAG2Result.metadata.matchType} match
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(selectedRAG2Result.relevanceScore * 100)}% relevance
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {selectedRAG2Result.metadata.wordCount} words
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedRAG2Result.content}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Source:</strong> {selectedRAG2Result.metadata.source}
                    </div>
                    <div>
                      <strong>Category:</strong> {selectedRAG2Result.category}
                    </div>
                    <div>
                      <strong>Document Type:</strong> {selectedRAG2Result.metadata.documentType || 'N/A'}
                    </div>
                    <div>
                      <strong>Platform:</strong> {selectedRAG2Result.metadata.platform || 'N/A'}
                    </div>
                  </div>
                  
                  {selectedRAG2Result.metadata.matchedTerms && selectedRAG2Result.metadata.matchedTerms.length > 0 && (
                    <div>
                      <strong>Matched Terms:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRAG2Result.metadata.matchedTerms.map((term, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="legacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Legacy RAG System
              </CardTitle>
              <CardDescription>
                Basic RAG implementation for comparison and fallback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RAGInterface onResultSelect={handleResultSelect} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {/* Advanced Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RAG 2.0 Features</CardTitle>
                <CardDescription>
                  Advanced capabilities for intelligent information retrieval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Hybrid Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Combines semantic vector search with keyword matching for optimal results
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Smart Chunking</h4>
                      <p className="text-sm text-muted-foreground">
                        Intelligent document segmentation preserving semantic boundaries
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Re-ranking</h4>
                      <p className="text-sm text-muted-foreground">
                        Multi-stage retrieval with intelligent result optimization
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Network className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Vector Database</h4>
                      <p className="text-sm text-muted-foreground">
                        PostgreSQL with pgvector for efficient similarity search
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>
                  Technical implementation details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Vector Store</h4>
                      <p className="text-sm text-muted-foreground">
                        PostgreSQL with pgvector extension for 1536-dimensional embeddings
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Cpu className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Embedding Service</h4>
                      <p className="text-sm text-muted-foreground">
                        TF-IDF based embeddings with vocabulary management
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Document Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Intelligent chunking with semantic boundary detection
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Real-time Indexing</h4>
                      <p className="text-sm text-muted-foreground">
                        Live document processing from attached assets and platform data
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
