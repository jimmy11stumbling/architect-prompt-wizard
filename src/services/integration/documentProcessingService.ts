
import { documentService, type Document } from "@/services/documents/documentService";
import { enhancedDeepSeekService } from "@/services/deepseek/enhancedDeepseekService";
import { enhancedMcpService } from "@/services/mcp/enhancedMcpService";

export interface DocumentProcessingPipeline {
  documentId: string;
  enableDeepSeekAnalysis: boolean;
  enableMcpProcessing: boolean;
  enableVectorEmbedding: boolean;
  mcpToolsToRun: string[];
  deepSeekAnalysisType: 'comprehensive' | 'summary' | 'structure' | 'reasoning';
  customPrompt?: string;
}

export interface ProcessingResult {
  success: boolean;
  documentId: string;
  deepSeekResults?: any;
  mcpResults?: any;
  vectorResults?: any;
  errors: string[];
  processingTimeMs: number;
  updatedDocument: Document;
}

class DocumentProcessingService {
  async processDocument(pipeline: DocumentProcessingPipeline): Promise<ProcessingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let deepSeekResults: any = null;
    let mcpResults: any = {};
    let vectorResults: any = null;

    try {
      // Get the document
      const document = await documentService.getDocumentById(pipeline.documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Update document status to processing
      await documentService.updateDocument(pipeline.documentId, {
        processingStatus: 'processing',
        processingProgress: 0
      });

      let progress = 0;
      const totalSteps = (pipeline.enableDeepSeekAnalysis ? 1 : 0) + 
                       (pipeline.enableMcpProcessing ? pipeline.mcpToolsToRun.length : 0) + 
                       (pipeline.enableVectorEmbedding ? 1 : 0);

      // Extract text if not already available
      let textContent = document.extractedText || '';
      if (!textContent && document.mimeType.startsWith('text/')) {
        // For text files, we could read the content here
        // For now, we'll assume it's in extractedText
        textContent = 'Sample document content for processing';
      }

      // Step 1: DeepSeek Analysis
      if (pipeline.enableDeepSeekAnalysis && textContent) {
        try {
          deepSeekResults = await enhancedDeepSeekService.analyzeDocument({
            text: textContent,
            analysisType: pipeline.deepSeekAnalysisType,
            customPrompt: pipeline.customPrompt
          });
          
          progress++;
          await documentService.updateDocument(pipeline.documentId, {
            processingProgress: Math.round((progress / totalSteps) * 100),
            deepseekAnalysis: deepSeekResults
          });
        } catch (error) {
          errors.push(`DeepSeek analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Step 2: MCP Tool Processing
      if (pipeline.enableMcpProcessing && pipeline.mcpToolsToRun.length > 0) {
        for (const toolName of pipeline.mcpToolsToRun) {
          try {
            let result;
            
            switch (toolName) {
              case 'document_analyzer':
                result = await enhancedMcpService.analyzeDocument(textContent, document.mimeType);
                break;
              case 'summarizer':
                result = await enhancedMcpService.summarizeContent(textContent);
                break;
              case 'code_analyzer':
                if (document.mimeType.includes('text/')) {
                  result = await enhancedMcpService.analyzeCode(textContent, 'auto');
                }
                break;
              case 'vector_embedder':
                result = await enhancedMcpService.generateEmbeddings(textContent);
                break;
              default:
                result = await enhancedMcpService.executeTool({
                  toolName,
                  operation: 'process',
                  input: { text: textContent, document: document }
                });
            }

            if (result) {
              mcpResults[toolName] = result;
            }
          } catch (error) {
            errors.push(`MCP tool ${toolName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          
          progress++;
          await documentService.updateDocument(pipeline.documentId, {
            processingProgress: Math.round((progress / totalSteps) * 100)
          });
        }
      }

      // Step 3: Vector Embedding (if not already done by MCP)
      if (pipeline.enableVectorEmbedding && !mcpResults.vector_embedder) {
        try {
          vectorResults = await enhancedMcpService.generateEmbeddings(textContent);
          progress++;
        } catch (error) {
          errors.push(`Vector embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Update final document
      const updatedDocument = await documentService.updateDocument(pipeline.documentId, {
        processingStatus: errors.length > 0 ? 'completed' : 'indexed',
        processingProgress: 100,
        mcpToolResults: mcpResults,
        vectorEmbeddings: vectorResults || mcpResults.vector_embedder,
        processedAt: new Date().toISOString()
      });

      const processingTime = Date.now() - startTime;

      return {
        success: errors.length === 0,
        documentId: pipeline.documentId,
        deepSeekResults,
        mcpResults,
        vectorResults,
        errors,
        processingTimeMs: processingTime,
        updatedDocument
      };

    } catch (error) {
      // Update document status to failed
      await documentService.updateDocument(pipeline.documentId, {
        processingStatus: 'failed',
        processingProgress: 0
      });

      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        documentId: pipeline.documentId,
        errors: [error instanceof Error ? error.message : 'Unknown processing error'],
        processingTimeMs: processingTime,
        updatedDocument: (await documentService.getDocumentById(pipeline.documentId))!
      };
    }
  }

  async batchProcessDocuments(pipelines: DocumentProcessingPipeline[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    for (const pipeline of pipelines) {
      const result = await this.processDocument(pipeline);
      results.push(result);
    }
    
    return results;
  }

  async getProcessingStatus(documentId: string): Promise<{ status: string; progress: number }> {
    const document = await documentService.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    return {
      status: document.processingStatus,
      progress: document.processingProgress
    };
  }

  async retryProcessing(documentId: string): Promise<ProcessingResult> {
    // Reset document status and retry with full pipeline
    await documentService.updateDocument(documentId, {
      processingStatus: 'pending',
      processingProgress: 0
    });

    return this.processDocument({
      documentId,
      enableDeepSeekAnalysis: true,
      enableMcpProcessing: true,
      enableVectorEmbedding: true,
      mcpToolsToRun: ['document_analyzer', 'summarizer', 'vector_embedder'],
      deepSeekAnalysisType: 'comprehensive'
    });
  }
}

export const documentProcessingService = new DocumentProcessingService();
