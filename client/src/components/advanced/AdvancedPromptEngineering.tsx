import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Settings, 
  FileText, 
  Save,
  Play,
  History,
  Target,
  TrendingUp,
  Code,
  Sparkles
} from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
  performance: number;
  usage: number;
}

interface PromptOptimization {
  originalPrompt: string;
  optimizedPrompt: string;
  improvements: string[];
  performanceGain: number;
  metrics: {
    clarity: number;
    specificity: number;
    effectiveness: number;
  };
}

export default function AdvancedPromptEngineering() {
  const [activeTab, setActiveTab] = useState<'templates' | 'optimization' | 'analytics'>('templates');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [promptText, setPromptText] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<PromptOptimization | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    // Load from API or use default templates
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'code-gen',
        name: 'Code Generation',
        description: 'Generate production-ready code with best practices',
        template: `Create a {language} {component_type} that {functionality}. 

Requirements:
- Follow {language} best practices
- Include proper error handling
- Add comprehensive documentation
- Use TypeScript if applicable
- Include unit tests

Context: {context}
Constraints: {constraints}`,
        variables: ['language', 'component_type', 'functionality', 'context', 'constraints'],
        category: 'Development',
        performance: 87,
        usage: 245
      },
      {
        id: 'system-design',
        name: 'System Architecture',
        description: 'Design scalable system architectures',
        template: `Design a {system_type} system for {use_case}.

Requirements:
- Handle {scale} users/requests
- Primary tech stack: {tech_stack}
- Must support: {features}
- Performance requirements: {performance_reqs}
- Security considerations: {security_reqs}

Include:
1. High-level architecture diagram
2. Component interactions
3. Data flow
4. Scalability considerations
5. Security measures
6. Monitoring and observability

Context: {context}`,
        variables: ['system_type', 'use_case', 'scale', 'tech_stack', 'features', 'performance_reqs', 'security_reqs', 'context'],
        category: 'Architecture',
        performance: 92,
        usage: 156
      },
      {
        id: 'ai-integration',
        name: 'AI Integration',
        description: 'Integrate AI capabilities into applications',
        template: `Implement {ai_capability} integration for {application_type}.

Specification:
- AI Model: {ai_model}
- Integration type: {integration_type}
- Input format: {input_format}
- Output format: {output_format}
- Performance requirements: {performance_reqs}

Implementation should include:
1. API integration setup
2. Error handling and fallbacks
3. Rate limiting and cost optimization
4. Response validation
5. User experience considerations
6. Testing strategy

Context: {context}
Constraints: {constraints}`,
        variables: ['ai_capability', 'application_type', 'ai_model', 'integration_type', 'input_format', 'output_format', 'performance_reqs', 'context', 'constraints'],
        category: 'AI/ML',
        performance: 89,
        usage: 198
      }
    ];
    
    setTemplates(defaultTemplates);
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setPromptText(template.template);
    
    // Initialize variables
    const newVariables: Record<string, string> = {};
    template.variables.forEach(variable => {
      newVariables[variable] = '';
    });
    setVariables(newVariables);
  };

  const generatePrompt = () => {
    if (!selectedTemplate) return;

    let generatedPrompt = selectedTemplate.template;
    
    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      generatedPrompt = generatedPrompt.replace(regex, value || `[${key}]`);
    });

    setPromptText(generatedPrompt);
  };

  const optimizePrompt = async () => {
    if (!customPrompt.trim()) return;
    
    setIsOptimizing(true);
    
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const optimizedResult: PromptOptimization = {
        originalPrompt: customPrompt,
        optimizedPrompt: `${customPrompt}\n\nOptimized version:\n- More specific instructions\n- Better structure\n- Clearer context\n- Enhanced constraints`,
        improvements: [
          'Added specific formatting requirements',
          'Included context boundaries',
          'Enhanced clarity with numbered steps',
          'Added validation criteria'
        ],
        performanceGain: 23,
        metrics: {
          clarity: 92,
          specificity: 88,
          effectiveness: 94
        }
      };
      
      setOptimization(optimizedResult);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all ${
              selectedTemplate?.id === template.id 
                ? 'ring-2 ring-blue-500 border-blue-500' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{template.name}</CardTitle>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">{template.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Performance
                  </span>
                  <span className="font-medium">{template.performance}%</span>
                </div>
                <Progress value={template.performance} className="h-1" />
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{template.usage} uses</span>
                  <span>{template.variables.length} variables</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure Template: {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTemplate.variables.map((variable) => (
                <div key={variable} className="space-y-2">
                  <Label htmlFor={variable} className="text-sm font-medium capitalize">
                    {variable.replace(/_/g, ' ')}
                  </Label>
                  <Input
                    id={variable}
                    value={variables[variable] || ''}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generatePrompt} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Prompt
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Configuration
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Generated Prompt</Label>
              <Textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Generated prompt will appear here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderOptimization = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Prompt Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Prompt</Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your prompt to optimize..."
              className="min-h-[150px]"
            />
          </div>
          
          <Button 
            onClick={optimizePrompt} 
            disabled={!customPrompt.trim() || isOptimizing}
            className="flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Optimize Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {optimization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Optimization Results
              <Badge variant="outline" className="ml-2">
                +{optimization.performanceGain}% improvement
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Clarity</Label>
                <div className="flex items-center gap-2">
                  <Progress value={optimization.metrics.clarity} className="flex-1" />
                  <span className="text-sm font-medium">{optimization.metrics.clarity}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Specificity</Label>
                <div className="flex items-center gap-2">
                  <Progress value={optimization.metrics.specificity} className="flex-1" />
                  <span className="text-sm font-medium">{optimization.metrics.specificity}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Effectiveness</Label>
                <div className="flex items-center gap-2">
                  <Progress value={optimization.metrics.effectiveness} className="flex-1" />
                  <span className="text-sm font-medium">{optimization.metrics.effectiveness}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Improvements Made</Label>
              <div className="space-y-1">
                {optimization.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {improvement}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Optimized Prompt</Label>
              <Textarea
                value={optimization.optimizedPrompt}
                readOnly
                className="min-h-[200px] font-mono text-sm bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold">{templates.reduce((sum, t) => sum + t.usage, 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold">
                  {Math.round(templates.reduce((sum, t) => sum + t.performance, 0) / templates.length)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{template.name}</span>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{template.usage} uses</span>
                    <span>{template.variables.length} variables</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={template.performance} className="w-20" />
                  <span className="text-sm font-medium w-12">{template.performance}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Prompt Engineering</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'templates' ? 'default' : 'outline'}
            onClick={() => setActiveTab('templates')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button
            variant={activeTab === 'optimization' ? 'default' : 'outline'}
            onClick={() => setActiveTab('optimization')}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Optimization
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {activeTab === 'templates' && renderTemplates()}
      {activeTab === 'optimization' && renderOptimization()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
}