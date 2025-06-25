
-- Create workflow definitions table
CREATE TABLE public.workflow_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  definition JSONB NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated'))
);

-- Create workflow executions table
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflow_definitions(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users NOT NULL
);

-- Add Row Level Security
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_definitions
CREATE POLICY "Users can view their own workflow definitions" 
  ON public.workflow_definitions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow definitions" 
  ON public.workflow_definitions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow definitions" 
  ON public.workflow_definitions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow definitions" 
  ON public.workflow_definitions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for workflow_executions
CREATE POLICY "Users can view their own workflow executions" 
  ON public.workflow_executions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow executions" 
  ON public.workflow_executions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow executions" 
  ON public.workflow_executions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add updated_at trigger for workflow_definitions
CREATE TRIGGER update_workflow_definitions_updated_at
  BEFORE UPDATE ON public.workflow_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
