
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  Brain, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  Download,
  Trash2,
  Eye,
  Clock
} from "lucide-react";
import { documentService, type Document, type DocumentFormat } from "@/services/documents/documentService";
import { documentProcessingService, type DocumentProcessingPipeline } from "@/services/integration/documentProcessingService";
import { enhancedMcpService, type McpTool } from "@/services/mcp/enhancedMcpService";
import { useToast } from "@/hooks/use-toast";

const DocumentManagementDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentFormats, setDocumentFormats] = useState<DocumentFormat[]>([]);
  const [mcpTools, setMcpTools] = useState<McpTool[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingPipeline, setProcessingPipeline] = useState<Partial<DocumentProcessingPipeline>>({
    enableDeepSeekAnalysis: true,
    enableMcpProcessing: true,
    enableVectorEmbedding: true,
    mcpToolsToRun: ['document_analyzer', 'summarizer'],
    deepSeekAnalysisType: 'comprehensive'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsData, formatsData, toolsData] = await Promise.all([
        documentService.getDocuments(),
        documentService.getDocumentFormats(),
        enhancedMcpService.getAvailableTools()
      ]);
      
      setDocuments(docsData);
      setDocumentFormats(formatsData);
      setMcpTools(toolsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load document data",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const document = await documentService.uploadDocument(selectedFile);
      
      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} has been uploaded successfully`,
      });

      // Start processing if enabled
      if (processingPipeline.enableDeepSeekAnalysis || processingPipeline.enableMcpProcessing) {
        await startProcessing(document.id);
      }

      setSelectedFile(null);
      await loadData();
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startProcessing = async (documentId: string) => {
    try {
      await documentProcessingService.processDocument({
        documentId,
        enableDeepSeekAnalysis: processingPipeline.enableDeepSeekAnalysis || false,
        enableMcpProcessing: processingPipeline.enableMcpProcessing || false,
        enableVectorEmbedding: processingPipeline.enableVectorEmbedding || false,
        mcpToolsToRun: processingPipeline.mcpToolsToRun || [],
        deepSeekAnalysisType: processingPipeline.deepSeekAnalysisType || 'comprehensive'
      });

      toast({
        title: "Processing Started",
        description: "Document processing has been initiated",
      });

      await loadData();
    } catch (error) {
      console.error('Processing failed:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'indexed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload & Process</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="processing">Processing Status</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.docx,.txt,.md,.html,.csv,.json,.xml"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="deepseek"
                    checked={processingPipeline.enableDeepSeekAnalysis}
                    onChange={(e) => setProcessingPipeline(prev => ({
                      ...prev,
                      enableDeepSeekAnalysis: e.target.checked
                    }))}
                  />
                  <Label htmlFor="deepseek">DeepSeek Analysis</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mcp"
                    checked={processingPipeline.enableMcpProcessing}
                    onChange={(e) => setProcessingPipeline(prev => ({
                      ...prev,
                      enableMcpProcessing: e.target.checked
                    }))}
                  />
                  <Label htmlFor="mcp">MCP Tools</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vector"
                    checked={processingPipeline.enableVectorEmbedding}
                    onChange={(e) => setProcessingPipeline(prev => ({
                      ...prev,
                      enableVectorEmbedding: e.target.checked
                    }))}
                  />
                  <Label htmlFor="vector">Vector Embeddings</Label>
                </div>
              </div>

              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Process
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="truncate">{doc.originalFilename}</span>
                    </div>
                    <Badge className={getStatusColor(doc.processingStatus)}>
                      {doc.processingStatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Size: {formatFileSize(doc.fileSize)}</p>
                    <p>Type: {doc.mimeType}</p>
                    <p>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>

                  {doc.processingStatus === 'processing' && (
                    <Progress value={doc.processingProgress} className="w-full" />
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {doc.processingStatus === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => startProcessing(doc.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => documentService.deleteDocument(doc.id).then(loadData)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Processing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.filter(doc => doc.processingStatus === 'processing').map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{doc.originalFilename}</span>
                      <Badge>Processing</Badge>
                    </div>
                    <Progress value={doc.processingProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {doc.processingProgress}% complete
                    </p>
                  </div>
                ))}
                
                {documents.filter(doc => doc.processingStatus === 'processing').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No documents currently processing
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documentFormats.map((format) => (
                    <div key={format.id} className="border rounded p-3">
                      <div className="font-medium">{format.formatName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format.mimeTypes.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available MCP Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mcpTools.map((tool) => (
                    <div key={tool.id} className="border rounded p-3">
                      <div className="font-medium">{tool.toolName}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {tool.description}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tool.capabilities.map((cap, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentManagementDashboard;
