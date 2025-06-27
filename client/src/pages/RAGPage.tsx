import { useState } from "react";
import RAGInterface from "@/components/rag/RAGInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Target, 
  Zap,
  TrendingUp,
  FileText,
  Clock
} from "lucide-react";

export default function RAGPage() {
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const handleResultSelect = (result: any) => {
    setSelectedResult(result);
    console.log('Selected RAG result:', result);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">RAG 2.0 Vector Search</h1>
        </div>
        <p className="text-muted-foreground">
          Advanced retrieval-augmented generation with hybrid search, semantic chunking, and intelligent re-ranking
        </p>
      </div>

      <div className="grid gap-6">
        {/* Main RAG Interface */}
        <RAGInterface onResultSelect={handleResultSelect} />

        {/* Advanced Features */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>RAG 2.0 Features</CardTitle>
                <CardDescription>
                  Advanced capabilities for intelligent information retrieval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
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
                          Intelligent document segmentation preserving semantic coherence
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Re-ranking Algorithm</h4>
                        <p className="text-sm text-muted-foreground">
                          Advanced scoring to surface the most relevant content first
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-orange-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Vector Database</h4>
                        <p className="text-sm text-muted-foreground">
                          High-performance embeddings storage with similarity search
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Context Compression</h4>
                        <p className="text-sm text-muted-foreground">
                          Intelligent context window management for large documents
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-indigo-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Real-time Updates</h4>
                        <p className="text-sm text-muted-foreground">
                          Incremental indexing for keeping knowledge base current
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="architecture">
            <Card>
              <CardHeader>
                <CardTitle>RAG 2.0 Architecture</CardTitle>
                <CardDescription>
                  System architecture and processing pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-semibold">Document Ingestion</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Clean, chunk, and preprocess documents
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h4 className="font-semibold">Vector Embedding</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generate TF-IDF based embeddings
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h4 className="font-semibold">Hybrid Search</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Combine semantic and keyword search
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Processing Pipeline</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                      <li>Document preprocessing and metadata extraction</li>
                      <li>Intelligent chunking with overlap preservation</li>
                      <li>TF-IDF vector embedding generation</li>
                      <li>Index construction with vocabulary building</li>
                      <li>Query processing and transformation</li>
                      <li>Hybrid search execution (semantic + keyword)</li>
                      <li>Result re-ranking and filtering</li>
                      <li>Context compression and response generation</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Result Details */}
        {selectedResult && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Result Details</CardTitle>
              <CardDescription>
                Detailed view of the selected search result
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Score:</strong> {(selectedResult.score * 100).toFixed(1)}%
                  </div>
                  <div>
                    <strong>Match Type:</strong> {selectedResult.metadata.matchType}
                  </div>
                  <div>
                    <strong>Platform:</strong> {selectedResult.metadata.platform || 'N/A'}
                  </div>
                  <div>
                    <strong>Category:</strong> {selectedResult.metadata.category}
                  </div>
                </div>
                <div>
                  <strong>Content:</strong>
                  <div className="mt-2 p-3 bg-muted rounded text-sm">
                    {selectedResult.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}