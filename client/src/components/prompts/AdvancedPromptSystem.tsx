import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Settings, 
  TestTube,
  Library,
  Copy,
  Download,
  Upload,
  Star,
  BarChart3,
  Lightbulb,
  Code,
  FileText,
  Eye
} from 'lucide-react';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: PromptVariable[];
  tags: string[];
  metadata: {
    creator: string;
    version: string;
    rating: number;
    usageCount: number;
    effectiveness: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface PromptVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiline';
  description: string;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface PromptOptimization {
  originalPrompt: string;
  optimizedPrompt: string;
  improvements: string[];
  metrics: {
    clarity: number;
    specificity: number;
    engagement: number;
    efficiency: number;
  };
  suggestions: string[];
}

export interface PromptExecution {
  id: string;
  templateId: string;
  prompt: string;
  variables: Record<string, any>;
  result: string;
  metrics: {
    responseTime: number;
    tokenCount: number;
    quality: number;
    relevance: number;
  };
  feedback: {
    rating: number;
    comments: string;
  };
  timestamp: Date;
}

interface AdvancedPromptSystemProps {
  onExecutePrompt?: (prompt: string, variables: Record<string, any>) => Promise<string>;
  onSaveTemplate?: (template: PromptTemplate) => Promise<void>;
  onLoadTemplates?: () => Promise<PromptTemplate[]>;
}

export const AdvancedPromptSystem: React.FC<AdvancedPromptSystemProps> = ({
  onExecutePrompt,
  onSaveTemplate,
  onLoadTemplates
}) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [executions, setExecutions] = useState<PromptExecution[]>([]);
  const [optimization, setOptimization] = useState<PromptOptimization | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Sample templates for demonstration
  const sampleTemplates: PromptTemplate[] = [
    {
      id: '1',
      name: 'Code Review Assistant',
      description: 'Comprehensive code review with suggestions',
      category: 'Development',
      template: `Review the following {{language}} code and provide detailed feedback:

Code:
\`\`\`{{language}}
{{code}}
\`\`\`

Please analyze:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance optimizations
4. Security considerations
5. Readability improvements

Focus on: {{focus_areas}}
Experience level: {{experience_level}}`,
      variables: [
        {
          name: 'language',
          type: 'select',
          description: 'Programming language',
          required: true,
          options: ['JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'Go', 'Rust']
        },
        {
          name: 'code',
          type: 'multiline',
          description: 'Code to review',
          required: true
        },
        {
          name: 'focus_areas',
          type: 'text',
          description: 'Specific areas to focus on',
          required: false,
          defaultValue: 'all aspects'
        },
        {
          name: 'experience_level',
          type: 'select',
          description: 'Developer experience level',
          required: true,
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
        }
      ],
      tags: ['code', 'review', 'quality', 'development'],
      metadata: {
        creator: 'system',
        version: '1.0',
        rating: 4.8,
        usageCount: 156,
        effectiveness: 92,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      }
    },
    {
      id: '2',
      name: 'Technical Documentation Writer',
      description: 'Generate comprehensive technical documentation',
      category: 'Documentation',
      template: `Create detailed technical documentation for:

Topic: {{topic}}
Audience: {{audience}}
Format: {{format}}

Requirements:
- Clear and concise explanations
- Step-by-step instructions where applicable
- Code examples if relevant
- Best practices and common pitfalls
- {{additional_requirements}}

Structure:
1. Overview
2. Prerequisites
3. Implementation
4. Examples
5. Troubleshooting
6. References`,
      variables: [
        {
          name: 'topic',
          type: 'text',
          description: 'Topic to document',
          required: true
        },
        {
          name: 'audience',
          type: 'select',
          description: 'Target audience',
          required: true,
          options: ['Developers', 'End Users', 'System Administrators', 'Technical Writers']
        },
        {
          name: 'format',
          type: 'select',
          description: 'Documentation format',
          required: true,
          options: ['Tutorial', 'Reference', 'How-to Guide', 'API Documentation']
        },
        {
          name: 'additional_requirements',
          type: 'multiline',
          description: 'Additional specific requirements',
          required: false
        }
      ],
      tags: ['documentation', 'technical', 'writing', 'guide'],
      metadata: {
        creator: 'system',
        version: '1.0',
        rating: 4.6,
        usageCount: 89,
        effectiveness: 88,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15')
      }
    }
  ];

  useEffect(() => {
    if (onLoadTemplates) {
      onLoadTemplates().then(setTemplates);
    } else {
      setTemplates(sampleTemplates);
    }
  }, [onLoadTemplates]);

  const renderPrompt = useCallback((template: string, vars: Record<string, any>): string => {
    let rendered = template;
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value || '');
    });
    return rendered;
  }, []);

  const executePrompt = useCallback(async () => {
    if (!onExecutePrompt || !currentPrompt) return;

    setIsExecuting(true);
    try {
      const startTime = Date.now();
      const result = await onExecutePrompt(currentPrompt, variables);
      const endTime = Date.now();

      const execution: PromptExecution = {
        id: crypto.randomUUID(),
        templateId: selectedTemplate?.id || 'custom',
        prompt: currentPrompt,
        variables,
        result,
        metrics: {
          responseTime: endTime - startTime,
          tokenCount: currentPrompt.length + result.length,
          quality: Math.random() * 30 + 70, // Simulated
          relevance: Math.random() * 20 + 80  // Simulated
        },
        feedback: {
          rating: 0,
          comments: ''
        },
        timestamp: new Date()
      };

      setExecutions(prev => [execution, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Prompt execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [currentPrompt, variables, selectedTemplate, onExecutePrompt]);

  const optimizePrompt = useCallback(async () => {
    if (!currentPrompt) return;

    setIsOptimizing(true);
    try {
      // Simulate prompt optimization analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      const optimization: PromptOptimization = {
        originalPrompt: currentPrompt,
        optimizedPrompt: currentPrompt + '\n\nPlease provide specific examples and actionable recommendations.',
        improvements: [
          'Added request for specific examples',
          'Included call for actionable recommendations',
          'Improved clarity and structure',
          'Enhanced specificity of requirements'
        ],
        metrics: {
          clarity: Math.random() * 20 + 80,
          specificity: Math.random() * 15 + 85,
          engagement: Math.random() * 25 + 75,
          efficiency: Math.random() * 20 + 80
        },
        suggestions: [
          'Consider adding more context about the target outcome',
          'Specify the desired format for the response',
          'Include examples of what good output looks like',
          'Add constraints or limitations to guide the response'
        ]
      };

      setOptimization(optimization);
    } catch (error) {
      console.error('Prompt optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [currentPrompt]);

  const selectTemplate = useCallback((template: PromptTemplate) => {
    setSelectedTemplate(template);
    setCurrentPrompt(template.template);
    
    // Initialize variables with default values
    const initialVars: Record<string, any> = {};
    template.variables.forEach(variable => {
      if (variable.defaultValue) {
        initialVars[variable.name] = variable.defaultValue;
      }
    });
    setVariables(initialVars);
  }, []);

  const updateVariable = useCallback((name: string, value: any) => {
    setVariables(prev => ({ ...prev, [name]: value }));
    
    if (selectedTemplate) {
      const rendered = renderPrompt(selectedTemplate.template, { ...variables, [name]: value });
      setCurrentPrompt(rendered);
    }
  }, [selectedTemplate, variables, renderPrompt]);

  const saveTemplate = useCallback(async () => {
    if (!onSaveTemplate || !currentPrompt) return;

    const template: PromptTemplate = {
      id: crypto.randomUUID(),
      name: 'Custom Template',
      description: 'User-created template',
      category: 'Custom',
      template: currentPrompt,
      variables: [],
      tags: [],
      metadata: {
        creator: 'user',
        version: '1.0',
        rating: 0,
        usageCount: 0,
        effectiveness: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    await onSaveTemplate(template);
    setTemplates(prev => [template, ...prev]);
  }, [currentPrompt, onSaveTemplate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold">Advanced Prompt Engineering</h2>
            <p className="text-sm text-gray-600">Create, optimize, and manage AI prompts</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={saveTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button onClick={optimizePrompt} disabled={isOptimizing || !currentPrompt}>
            <Target className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Library */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5" />
              Template Library
            </CardTitle>
            <CardDescription>Pre-built prompt templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map(template => (
              <div
                key={template.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">{template.metadata.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Prompt Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Prompt Editor
            </CardTitle>
            <CardDescription>Create and edit your prompts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="editor">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <div>
                  <Label htmlFor="prompt-editor">Prompt Template</Label>
                  <Textarea
                    id="prompt-editor"
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    placeholder="Enter your prompt template here... Use {{variable_name}} for dynamic content."
                    rows={12}
                    className="font-mono"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button onClick={executePrompt} disabled={isExecuting || !currentPrompt}>
                    <Zap className="h-4 w-4 mr-2" />
                    {isExecuting ? 'Executing...' : 'Execute Prompt'}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPrompt('')}>
                    Clear
                  </Button>
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(currentPrompt)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="variables" className="space-y-4">
                {selectedTemplate?.variables.length ? (
                  <div className="space-y-4">
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable.name} className="space-y-2">
                        <Label htmlFor={variable.name}>
                          {variable.name}
                          {variable.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <p className="text-xs text-gray-600">{variable.description}</p>
                        
                        {variable.type === 'text' && (
                          <Input
                            id={variable.name}
                            value={variables[variable.name] || ''}
                            onChange={(e) => updateVariable(variable.name, e.target.value)}
                            placeholder={variable.defaultValue}
                          />
                        )}
                        
                        {variable.type === 'multiline' && (
                          <Textarea
                            id={variable.name}
                            value={variables[variable.name] || ''}
                            onChange={(e) => updateVariable(variable.name, e.target.value)}
                            placeholder={variable.defaultValue}
                            rows={4}
                          />
                        )}
                        
                        {variable.type === 'select' && variable.options && (
                          <Select
                            value={variables[variable.name] || ''}
                            onValueChange={(value) => updateVariable(variable.name, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {variable.options.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No variables defined for this template</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div>
                  <Label>Rendered Prompt</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50 font-mono text-sm whitespace-pre-wrap">
                    {selectedTemplate ? renderPrompt(selectedTemplate.template, variables) : currentPrompt}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Results */}
      {optimization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Prompt Optimization Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(optimization.metrics).map(([metric, score]) => (
                <div key={metric} className="text-center">
                  <div className="text-2xl font-bold">{score.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600 capitalize">{metric}</div>
                  <Progress value={score} className="mt-2" />
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Improvements Made</h4>
                <ul className="space-y-1">
                  {optimization.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Suggestions</h4>
                <ul className="space-y-1">
                  {optimization.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setCurrentPrompt(optimization.optimizedPrompt)}>
                Apply Optimization
              </Button>
              <Button variant="outline" onClick={() => setOptimization(null)}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution History */}
      {executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Execution History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {executions.slice(0, 5).map(execution => (
                <div key={execution.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {execution.templateId === 'custom' ? 'Custom Prompt' : 
                       templates.find(t => t.id === execution.templateId)?.name || 'Unknown Template'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {execution.timestamp.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Response Time</span>
                      <div className="font-mono">{execution.metrics.responseTime}ms</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Tokens</span>
                      <div className="font-mono">{execution.metrics.tokenCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Quality</span>
                      <div className="font-mono">{execution.metrics.quality.toFixed(0)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Relevance</span>
                      <div className="font-mono">{execution.metrics.relevance.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedPromptSystem;