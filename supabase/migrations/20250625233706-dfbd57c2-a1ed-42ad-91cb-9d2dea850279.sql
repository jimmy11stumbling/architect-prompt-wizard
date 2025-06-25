
-- Create enhanced document formats table
CREATE TABLE IF NOT EXISTS public.document_formats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  format_name TEXT NOT NULL UNIQUE,
  mime_types TEXT[] NOT NULL DEFAULT '{}',
  supported_operations TEXT[] NOT NULL DEFAULT '{}',
  processing_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enhanced documents table with format support
DROP TABLE IF EXISTS public.documents CASCADE;
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  format_id UUID REFERENCES public.document_formats(id),
  storage_path TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'indexed')),
  processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
  extracted_text TEXT,
  metadata JSONB DEFAULT '{}',
  ai_analysis JSONB DEFAULT '{}',
  vector_embeddings JSONB DEFAULT '{}',
  deepseek_analysis JSONB DEFAULT '{}',
  mcp_tool_results JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create DeepSeek integration configurations
CREATE TABLE IF NOT EXISTS public.deepseek_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  config_name TEXT NOT NULL,
  model_name TEXT DEFAULT 'deepseek-reasoner',
  api_settings JSONB DEFAULT '{}',
  prompt_templates JSONB DEFAULT '{}',
  processing_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create MCP tools registry
CREATE TABLE IF NOT EXISTS public.mcp_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL UNIQUE,
  tool_type TEXT NOT NULL,
  description TEXT,
  configuration JSONB DEFAULT '{}',
  capabilities TEXT[] DEFAULT '{}',
  supported_formats TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create AI processing jobs table
CREATE TABLE IF NOT EXISTS public.ai_processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('deepseek_analysis', 'mcp_processing', 'vector_embedding', 'full_pipeline')),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_details TEXT,
  processing_time_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.document_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deepseek_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for DeepSeek configurations
CREATE POLICY "Users can manage their own deepseek configs" ON public.deepseek_configurations
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for AI processing jobs
CREATE POLICY "Users can view their own processing jobs" ON public.ai_processing_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processing jobs" ON public.ai_processing_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processing jobs" ON public.ai_processing_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- MCP tools are publicly readable but only admins can modify (for now, make them public)
CREATE POLICY "Anyone can view mcp tools" ON public.mcp_tools
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage mcp tools" ON public.mcp_tools
  FOR ALL USING (true);

-- Document formats are publicly readable
CREATE POLICY "Anyone can view document formats" ON public.document_formats
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage document formats" ON public.document_formats
  FOR ALL USING (true);

-- Insert default document formats
INSERT INTO public.document_formats (format_name, mime_types, supported_operations, processing_config) VALUES
('PDF', ARRAY['application/pdf'], ARRAY['text_extraction', 'deepseek_analysis', 'vector_embedding'], '{"supports_ocr": true, "chunking_strategy": "semantic"}'),
('Word Document', ARRAY['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'], ARRAY['text_extraction', 'deepseek_analysis', 'vector_embedding'], '{"preserve_formatting": true}'),
('Plain Text', ARRAY['text/plain'], ARRAY['text_extraction', 'deepseek_analysis', 'vector_embedding'], '{"encoding": "utf-8"}'),
('Markdown', ARRAY['text/markdown'], ARRAY['text_extraction', 'deepseek_analysis', 'vector_embedding'], '{"parse_structure": true}'),
('HTML', ARRAY['text/html'], ARRAY['text_extraction', 'deepseek_analysis', 'vector_embedding'], '{"extract_clean_text": true}'),
('CSV', ARRAY['text/csv'], ARRAY['data_analysis', 'deepseek_analysis'], '{"delimiter": ",", "has_header": true}'),
('JSON', ARRAY['application/json'], ARRAY['data_analysis', 'deepseek_analysis'], '{"parse_structure": true}'),
('XML', ARRAY['application/xml', 'text/xml'], ARRAY['data_analysis', 'deepseek_analysis'], '{"parse_structure": true}')
ON CONFLICT (format_name) DO NOTHING;

-- Insert default MCP tools
INSERT INTO public.mcp_tools (tool_name, tool_type, description, configuration, capabilities, supported_formats) VALUES
('document_analyzer', 'analysis', 'Advanced document analysis and structure extraction', '{"model": "deepseek-reasoner", "max_tokens": 4000}', ARRAY['text_analysis', 'structure_detection', 'content_classification'], ARRAY['pdf', 'docx', 'txt', 'md']),
('web_search', 'retrieval', 'Web search and information retrieval', '{"search_engine": "brave", "max_results": 10}', ARRAY['web_search', 'fact_checking', 'research'], ARRAY['all']),
('code_analyzer', 'analysis', 'Code analysis and documentation generation', '{"languages": ["typescript", "python", "javascript"], "analysis_depth": "comprehensive"}', ARRAY['code_analysis', 'documentation', 'refactoring_suggestions'], ARRAY['txt', 'md']),
('data_processor', 'processing', 'Data processing and transformation utilities', '{"supported_formats": ["csv", "json", "xml"]}', ARRAY['data_transformation', 'statistical_analysis', 'visualization'], ARRAY['csv', 'json', 'xml']),
('vector_embedder', 'embedding', 'Generate vector embeddings for semantic search', '{"model": "text-embedding-3-small", "dimensions": 1536}', ARRAY['text_embedding', 'semantic_search', 'similarity_matching'], ARRAY['txt', 'md', 'pdf', 'docx']),
('summarizer', 'nlp', 'Document summarization and key point extraction', '{"model": "deepseek-reasoner", "summary_types": ["brief", "detailed", "bullet_points"]}', ARRAY['summarization', 'key_extraction', 'content_condensation'], ARRAY['pdf', 'docx', 'txt', 'md', 'html'])
ON CONFLICT (tool_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_processing_status ON public.documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_mime_type ON public.documents(mime_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_processing_jobs_user_id ON public.ai_processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_jobs_status ON public.ai_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_processing_jobs_document_id ON public.ai_processing_jobs(document_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deepseek_configurations_updated_at BEFORE UPDATE ON public.deepseek_configurations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mcp_tools_updated_at BEFORE UPDATE ON public.mcp_tools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
