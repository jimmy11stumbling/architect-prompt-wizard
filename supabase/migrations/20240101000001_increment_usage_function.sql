
-- Create function to safely increment prompt usage
CREATE OR REPLACE FUNCTION increment_prompt_usage(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.prompts 
  SET usage_count = COALESCE(usage_count, 0) + 1,
      updated_at = NOW()
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
