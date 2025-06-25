
-- Create knowledge_base table for storing knowledge articles/documents
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  source_type TEXT DEFAULT 'manual', -- manual, uploaded, imported, etc.
  source_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active', -- active, archived, draft
  priority INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_instructions table for storing user-specific AI instructions
CREATE TABLE public.custom_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  instruction_text TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_global BOOLEAN DEFAULT FALSE, -- applies to all prompts vs specific use cases
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- higher priority instructions applied first
  applies_to TEXT[] DEFAULT '{}', -- specific prompt types this applies to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_base_categories table for organizing knowledge
CREATE TABLE public.knowledge_base_categories (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_category TEXT REFERENCES public.knowledge_base_categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create instruction_templates table for reusable instruction patterns
CREATE TABLE public.instruction_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  description TEXT,
  category TEXT,
  variables TEXT[] DEFAULT '{}', -- placeholder variables in template
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instruction_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_base
CREATE POLICY "Users can view their own knowledge base entries" 
  ON public.knowledge_base FOR SELECT 
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own knowledge base entries" 
  ON public.knowledge_base FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge base entries" 
  ON public.knowledge_base FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge base entries" 
  ON public.knowledge_base FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for custom_instructions
CREATE POLICY "Users can view their own custom instructions" 
  ON public.custom_instructions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom instructions" 
  ON public.custom_instructions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom instructions" 
  ON public.custom_instructions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom instructions" 
  ON public.custom_instructions FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for knowledge_base_categories (public read, admin write)
CREATE POLICY "Anyone can view knowledge base categories" 
  ON public.knowledge_base_categories FOR SELECT 
  TO PUBLIC USING (TRUE);

-- RLS Policies for instruction_templates
CREATE POLICY "Users can view public templates and their own templates" 
  ON public.instruction_templates FOR SELECT 
  USING (is_public = TRUE OR auth.uid() = created_by);

CREATE POLICY "Users can create their own instruction templates" 
  ON public.instruction_templates FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own instruction templates" 
  ON public.instruction_templates FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own instruction templates" 
  ON public.instruction_templates FOR DELETE 
  USING (auth.uid() = created_by);

-- Insert default knowledge base categories
INSERT INTO public.knowledge_base_categories (id, name, description, icon, sort_order) VALUES
  ('technical', 'Technical Documentation', 'Programming, frameworks, and technical guides', 'Code', 1),
  ('business', 'Business Knowledge', 'Business processes, strategies, and domain knowledge', 'Briefcase', 2),
  ('ai-prompts', 'AI & Prompts', 'AI-related knowledge and prompt engineering', 'Bot', 3),
  ('tutorials', 'Tutorials & Guides', 'Step-by-step tutorials and how-to guides', 'BookOpen', 4),
  ('reference', 'Reference Materials', 'Quick reference materials and cheat sheets', 'FileText', 5),
  ('personal', 'Personal Notes', 'Personal knowledge and private notes', 'User', 6);

-- Create indexes for better performance
CREATE INDEX idx_knowledge_base_user_id ON public.knowledge_base(user_id);
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX idx_knowledge_base_tags ON public.knowledge_base USING GIN(tags);
CREATE INDEX idx_knowledge_base_status ON public.knowledge_base(status);
CREATE INDEX idx_custom_instructions_user_id ON public.custom_instructions(user_id);
CREATE INDEX idx_custom_instructions_category ON public.custom_instructions(category);
CREATE INDEX idx_custom_instructions_active ON public.custom_instructions(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_instructions_updated_at BEFORE UPDATE ON public.custom_instructions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instruction_templates_updated_at BEFORE UPDATE ON public.instruction_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
