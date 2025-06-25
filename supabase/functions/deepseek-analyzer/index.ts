
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeepSeekRequest {
  text: string;
  analysisType: 'comprehensive' | 'summary' | 'structure' | 'reasoning' | 'code_analysis' | 'custom';
  customPrompt?: string;
  config?: any;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const { text, analysisType, customPrompt, config, metadata }: DeepSeekRequest = await req.json();

    if (!text) {
      throw new Error('Text content is required');
    }

    const prompts = {
      comprehensive: `Provide a comprehensive analysis of the following text. Include key insights, themes, structure, and important details:\n\n${text}`,
      summary: `Summarize the following text, highlighting the main points and key information:\n\n${text}`,
      structure: `Analyze the structure and organization of the following text. Identify sections, headers, and logical flow:\n\n${text}`,
      reasoning: `Analyze the following text and provide detailed reasoning about its content, arguments, and conclusions:\n\n${text}`,
      code_analysis: `Analyze the following code, explaining its functionality, structure, and any potential improvements:\n\n${text}`,
      custom: customPrompt || `Analyze the following text:\n\n${text}`
    };

    const prompt = prompts[analysisType] || prompts.comprehensive;

    console.log('Sending request to DeepSeek API...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config?.modelName || 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content: 'You are an expert analyst. Provide detailed, structured analysis with clear reasoning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config?.apiSettings?.maxTokens || 4000,
        temperature: config?.apiSettings?.temperature || 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || '';
    
    // Extract reasoning if available
    const reasoning = data.choices[0]?.reasoning || null;

    // Extract key points (simple extraction for now)
    const keyPoints = analysis.split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.includes('key'))
      .slice(0, 5);

    console.log('DeepSeek analysis completed successfully');

    return new Response(
      JSON.stringify({
        analysis,
        reasoning,
        confidence: 0.85, // Default confidence
        keyPoints,
        structure: analysisType === 'structure' ? { analyzed: true } : null,
        metadata: {
          model: config?.modelName || 'deepseek-reasoner',
          analysisType,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in deepseek-analyzer:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        analysis: '',
        confidence: 0,
        keyPoints: [],
        metadata: { error: true, timestamp: new Date().toISOString() }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
