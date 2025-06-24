
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompts table
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  author TEXT,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  complexity TEXT CHECK (complexity IN ('beginner', 'intermediate', 'advanced')),
  tech_stack TEXT[] DEFAULT '{}',
  estimated_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt categories table
CREATE TABLE public.prompt_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generation history table
CREATE TABLE public.generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id TEXT NOT NULL,
  project_spec JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result TEXT,
  error_message TEXT,
  agents_data JSONB DEFAULT '[]',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved project specs table
CREATE TABLE public.saved_project_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  spec_data JSONB NOT NULL,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default prompt categories
INSERT INTO public.prompt_categories (id, name, description, icon) VALUES
('web-apps', 'Web Applications', 'Full-stack web application prompts', '🌐'),
('mobile-apps', 'Mobile Apps', 'Mobile application development prompts', '📱'),
('ai-ml', 'AI & Machine Learning', 'AI/ML integration and implementation prompts', '🤖'),
('data-analytics', 'Data Analytics', 'Data processing and analytics prompts', '📊'),
('automation', 'Automation', 'Workflow and process automation prompts', '⚡'),
('creative', 'Creative Projects', 'Creative and artistic project prompts', '🎨');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_project_specs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for prompts
CREATE POLICY "Users can view their own prompts" ON public.prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public prompts" ON public.prompts
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can insert their own prompts" ON public.prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" ON public.prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" ON public.prompts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for prompt categories (public read)
CREATE POLICY "Anyone can view prompt categories" ON public.prompt_categories
  FOR SELECT TO authenticated USING (TRUE);

-- Create RLS policies for generation history
CREATE POLICY "Users can view their own generation history" ON public.generation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation history" ON public.generation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation history" ON public.generation_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generation history" ON public.generation_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved project specs
CREATE POLICY "Users can view their own project specs" ON public.saved_project_specs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON public.saved_project_specs
  FOR SELECT USING (is_template = TRUE);

CREATE POLICY "Users can insert their own project specs" ON public.saved_project_specs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project specs" ON public.saved_project_specs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project specs" ON public.saved_project_specs
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX idx_prompts_category ON public.prompts(category);
CREATE INDEX idx_prompts_is_public ON public.prompts(is_public);
CREATE INDEX idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_task_id ON public.generation_history(task_id);
CREATE INDEX idx_saved_project_specs_user_id ON public.saved_project_specs(user_id);
CREATE INDEX idx_saved_project_specs_is_template ON public.saved_project_specs(is_template);
