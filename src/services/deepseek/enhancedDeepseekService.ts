
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DeepSeekConfigRow = Database['public']['Tables']['deepseek_configurations']['Row'];

export interface DeepSeekConfiguration {
  id: string;
  configName: string;
  modelName: string;
  apiSettings: any;
  promptTemplates: any;
  processingRules: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeepSeekAnalysisRequest {
  text: string;
  analysisType: 'comprehensive' | 'summary' | 'structure' | 'reasoning' | 'code_analysis' | 'custom';
  customPrompt?: string;
  configId?: string;
  metadata?: any;
}

export interface DeepSeekAnalysisResponse {
  analysis: string;
  reasoning?: string;
  confidence: number;
  keyPoints: string[];
  structure?: any;
  metadata: any;
  processingTimeMs: number;
}

class EnhancedDeepSeekService {
  private async getConfiguration(configId?: string): Promise<DeepSeekConfiguration | null> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return null;

    let query = supabase
      .from('deepseek_configurations')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('is_active', true);

    if (configId) {
      query = query.eq('id', configId);
    } else {
      query = query.limit(1);
    }

    const { data, error } = await query.single();

    if (error || !data) return null;

    return {
      id: data.id,
      configName: data.config_name,
      modelName: data.model_name || 'deepseek-reasoner',
      apiSettings: data.api_settings || {},
      promptTemplates: data.prompt_templates || {},
      processingRules: data.processing_rules || {},
      isActive: data.is_active || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async analyzeDocument(request: DeepSeekAnalysisRequest): Promise<DeepSeekAnalysisResponse> {
    const startTime = Date.now();
    const config = await this.getConfiguration(request.configId);
    
    try {
      // Call the DeepSeek edge function
      const { data, error } = await supabase.functions.invoke('deepseek-analyzer', {
        body: {
          text: request.text,
          analysisType: request.analysisType,
          customPrompt: request.customPrompt,
          config: config,
          metadata: request.metadata
        }
      });

      if (error) throw error;

      const processingTime = Date.now() - startTime;

      return {
        analysis: data.analysis || '',
        reasoning: data.reasoning,
        confidence: data.confidence || 0.8,
        keyPoints: data.keyPoints || [],
        structure: data.structure,
        metadata: {
          ...request.metadata,
          modelUsed: config?.modelName || 'deepseek-reasoner',
          analysisType: request.analysisType,
          timestamp: new Date().toISOString()
        },
        processingTimeMs: processingTime
      };
    } catch (error) {
      console.error('DeepSeek analysis failed:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createConfiguration(config: Omit<DeepSeekConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeepSeekConfiguration> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('deepseek_configurations')
      .insert({
        user_id: user.data.user.id,
        config_name: config.configName,
        model_name: config.modelName,
        api_settings: config.apiSettings,
        prompt_templates: config.promptTemplates,
        processing_rules: config.processingRules,
        is_active: config.isActive
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      configName: data.config_name,
      modelName: data.model_name || 'deepseek-reasoner',
      apiSettings: data.api_settings || {},
      promptTemplates: data.prompt_templates || {},
      processingRules: data.processing_rules || {},
      isActive: data.is_active || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async getConfigurations(): Promise<DeepSeekConfiguration[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return [];

    const { data, error } = await supabase
      .from('deepseek_configurations')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(row => ({
      id: row.id,
      configName: row.config_name,
      modelName: row.model_name || 'deepseek-reasoner',
      apiSettings: row.api_settings || {},
      promptTemplates: row.prompt_templates || {},
      processingRules: row.processing_rules || {},
      isActive: row.is_active || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async performReasoningAnalysis(text: string, question: string): Promise<DeepSeekAnalysisResponse> {
    return this.analyzeDocument({
      text,
      analysisType: 'reasoning',
      customPrompt: `Analyze the following text and answer this question with detailed reasoning: ${question}\n\nText: ${text}`
    });
  }

  async summarizeDocument(text: string, summaryType: 'brief' | 'detailed' | 'bullet_points' = 'detailed'): Promise<DeepSeekAnalysisResponse> {
    const prompts = {
      brief: 'Provide a brief 2-3 sentence summary of the main points.',
      detailed: 'Provide a comprehensive summary covering all key points and insights.',
      bullet_points: 'Summarize the content as clear bullet points highlighting the main ideas.'
    };

    return this.analyzeDocument({
      text,
      analysisType: 'summary',
      customPrompt: prompts[summaryType],
      metadata: { summaryType }
    });
  }

  async extractStructure(text: string): Promise<DeepSeekAnalysisResponse> {
    return this.analyzeDocument({
      text,
      analysisType: 'structure',
      customPrompt: 'Analyze the structure of this document and extract key sections, headings, and organizational elements.'
    });
  }
}

export const enhancedDeepSeekService = new EnhancedDeepSeekService();
