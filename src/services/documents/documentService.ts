
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DocumentRow = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentFormatRow = Database['public']['Tables']['document_formats']['Row'];
type AIProcessingJobRow = Database['public']['Tables']['ai_processing_jobs']['Row'];

export interface Document {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  formatId?: string;
  storagePath?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'indexed';
  processingProgress: number;
  extractedText?: string;
  metadata: any;
  aiAnalysis: any;
  vectorEmbeddings: any;
  deepseekAnalysis: any;
  mcpToolResults: any;
  tags: string[];
  category?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

export interface DocumentFormat {
  id: string;
  formatName: string;
  mimeTypes: string[];
  supportedOperations: string[];
  processingConfig: any;
  isActive: boolean;
}

export interface AIProcessingJob {
  id: string;
  documentId: string;
  jobType: 'deepseek_analysis' | 'mcp_processing' | 'vector_embedding' | 'full_pipeline';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  inputData: any;
  outputData: any;
  errorDetails?: string;
  processingTimeMs?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

class DocumentService {
  private convertFromDb(row: DocumentRow): Document {
    return {
      id: row.id,
      filename: row.filename,
      originalFilename: row.original_filename,
      fileSize: Number(row.file_size),
      mimeType: row.mime_type,
      formatId: row.format_id || undefined,
      storagePath: row.storage_path || undefined,
      processingStatus: row.processing_status as Document['processingStatus'],
      processingProgress: row.processing_progress || 0,
      extractedText: row.extracted_text || undefined,
      metadata: row.metadata || {},
      aiAnalysis: row.ai_analysis || {},
      vectorEmbeddings: row.vector_embeddings || {},
      deepseekAnalysis: row.deepseek_analysis || {},
      mcpToolResults: row.mcp_tool_results || {},
      tags: row.tags || [],
      category: row.category || undefined,
      isPublic: row.is_public || false,
      createdAt: row.created_at!,
      updatedAt: row.updated_at!,
      processedAt: row.processed_at || undefined
    };
  }

  async uploadDocument(file: File): Promise<Document> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be authenticated to upload documents');
    }

    // Get document format
    const { data: format } = await supabase
      .from('document_formats')
      .select('*')
      .contains('mime_types', [file.type])
      .single();

    const insertData: DocumentInsert = {
      user_id: user.data.user.id,
      filename: `${Date.now()}_${file.name}`,
      original_filename: file.name,
      file_size: file.size,
      mime_type: file.type,
      format_id: format?.id,
      processing_status: 'pending'
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.convertFromDb(data);
  }

  async getDocuments(): Promise<Document[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return [];

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async getDocumentById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.convertFromDb(data);
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const updateData: any = {};
    
    if (updates.processingStatus) updateData.processing_status = updates.processingStatus;
    if (updates.processingProgress !== undefined) updateData.processing_progress = updates.processingProgress;
    if (updates.extractedText) updateData.extracted_text = updates.extractedText;
    if (updates.metadata) updateData.metadata = updates.metadata;
    if (updates.aiAnalysis) updateData.ai_analysis = updates.aiAnalysis;
    if (updates.vectorEmbeddings) updateData.vector_embeddings = updates.vectorEmbeddings;
    if (updates.deepseekAnalysis) updateData.deepseek_analysis = updates.deepseekAnalysis;
    if (updates.mcpToolResults) updateData.mcp_tool_results = updates.mcpToolResults;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.category) updateData.category = updates.category;
    if (updates.processedAt) updateData.processed_at = updates.processedAt;

    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.convertFromDb(data);
  }

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getDocumentFormats(): Promise<DocumentFormat[]> {
    const { data, error } = await supabase
      .from('document_formats')
      .select('*')
      .eq('is_active', true)
      .order('format_name');

    if (error) throw error;
    return data.map(row => ({
      id: row.id,
      formatName: row.format_name,
      mimeTypes: row.mime_types,
      supportedOperations: row.supported_operations,
      processingConfig: row.processing_config,
      isActive: row.is_active || false
    }));
  }

  async createProcessingJob(documentId: string, jobType: AIProcessingJob['jobType'], inputData: any = {}): Promise<AIProcessingJob> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('ai_processing_jobs')
      .insert({
        user_id: user.data.user.id,
        document_id: documentId,
        job_type: jobType,
        input_data: inputData,
        status: 'queued'
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      documentId: data.document_id,
      jobType: data.job_type as AIProcessingJob['jobType'],
      status: data.status as AIProcessingJob['status'],
      progress: data.progress || 0,
      inputData: data.input_data || {},
      outputData: data.output_data || {},
      errorDetails: data.error_details || undefined,
      processingTimeMs: data.processing_time_ms || undefined,
      startedAt: data.started_at || undefined,
      completedAt: data.completed_at || undefined,
      createdAt: data.created_at
    };
  }

  async getProcessingJobs(documentId?: string): Promise<AIProcessingJob[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return [];

    let query = supabase
      .from('ai_processing_jobs')
      .select('*')
      .eq('user_id', user.data.user.id);

    if (documentId) {
      query = query.eq('document_id', documentId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(row => ({
      id: row.id,
      documentId: row.document_id,
      jobType: row.job_type as AIProcessingJob['jobType'],
      status: row.status as AIProcessingJob['status'],
      progress: row.progress || 0,
      inputData: row.input_data || {},
      outputData: row.output_data || {},
      errorDetails: row.error_details || undefined,
      processingTimeMs: row.processing_time_ms || undefined,
      startedAt: row.started_at || undefined,
      completedAt: row.completed_at || undefined,
      createdAt: row.created_at
    }));
  }
}

export const documentService = new DocumentService();
