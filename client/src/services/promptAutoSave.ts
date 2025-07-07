import { promptService, SavedPrompt } from '@/services/api/promptService';
import { ProjectSpec } from '@/types/ipa-types';
import { toast } from '@/hooks/use-toast';

export class PromptAutoSaveService {
  static async autoSaveGeneratedPrompt(
    prompt: string, 
    spec: ProjectSpec,
    taskId?: string
  ): Promise<SavedPrompt | null> {
    try {
      // Generate a meaningful title based on the project spec
      const title = this.generatePromptTitle(spec);
      
      // Generate tags based on the tech stack and features
      const tags = this.generateTags(spec);
      
      // Create description
      const description = this.generateDescription(spec);
      
      const savedPrompt = await promptService.savePrompt({
        title,
        description,
        prompt,
        tags,
        isPublic: false, // Private by default, user can change later
        userId: null, // No user authentication yet
      });

      console.log('Auto-saved prompt:', savedPrompt);
      
      toast({
        title: "Prompt Saved",
        description: `"${title}" has been automatically saved to your library`,
      });

      return savedPrompt;
    } catch (error) {
      console.error('Failed to auto-save prompt:', error);
      
      toast({
        title: "Auto-save Failed",
        description: "Prompt generation completed but could not be saved automatically",
        variant: "destructive",
      });
      
      return null;
    }
  }

  private static generatePromptTitle(spec: ProjectSpec): string {
    const projectDesc = spec.projectDescription?.trim();
    
    if (projectDesc && projectDesc.length > 0) {
      // Use first part of project description, up to 50 characters
      const title = projectDesc.length > 50 
        ? projectDesc.substring(0, 50) + "..." 
        : projectDesc;
      return title;
    }
    
    // Fallback: generate title based on tech stack
    const frontend = spec.frontendTechStack[0] || 'Frontend';
    const backend = spec.backendTechStack[0] || 'Backend';
    return `${frontend} + ${backend} Project`;
  }

  private static generateTags(spec: ProjectSpec): string[] {
    const tags: string[] = [];
    
    // Add tech stack tags
    tags.push(...spec.frontendTechStack);
    tags.push(...spec.backendTechStack);
    tags.push(...spec.customFrontendTech);
    tags.push(...spec.customBackendTech);
    
    // Add feature-based tags
    if (spec.ragVectorDb && spec.ragVectorDb !== 'None') {
      tags.push('RAG', 'Vector Database', spec.ragVectorDb);
    }
    
    if (spec.mcpType && spec.mcpType !== 'None') {
      tags.push('MCP', 'Model Context Protocol');
    }
    
    if (spec.a2aIntegrationDetails) {
      tags.push('A2A', 'Agent Communication');
    }
    
    if (spec.authenticationMethod) {
      tags.push('Authentication', spec.authenticationMethod);
    }
    
    if (spec.deploymentPreference) {
      tags.push('Deployment', spec.deploymentPreference);
    }
    
    // Remove duplicates and empty values
    return [...new Set(tags.filter(tag => tag && tag.trim().length > 0))];
  }

  private static generateDescription(spec: ProjectSpec): string {
    const parts: string[] = [];
    
    if (spec.frontendTechStack.length > 0) {
      parts.push(`Frontend: ${spec.frontendTechStack.join(', ')}`);
    }
    
    if (spec.backendTechStack.length > 0) {
      parts.push(`Backend: ${spec.backendTechStack.join(', ')}`);
    }
    
    if (spec.ragVectorDb && spec.ragVectorDb !== 'None') {
      parts.push(`RAG: ${spec.ragVectorDb}`);
    }
    
    if (spec.mcpType && spec.mcpType !== 'None') {
      parts.push(`MCP: ${spec.mcpType}`);
    }
    
    if (spec.authenticationMethod) {
      parts.push(`Auth: ${spec.authenticationMethod}`);
    }
    
    if (spec.deploymentPreference) {
      parts.push(`Deploy: ${spec.deploymentPreference}`);
    }
    
    const description = parts.length > 0 
      ? `Auto-generated prompt for: ${parts.join(' | ')}`
      : 'Auto-generated AI development prompt';
    
    return description;
  }

  static isAutoSaveEnabled(): boolean {
    return localStorage.getItem('autoSavePrompts') !== 'false';
  }

  static setAutoSaveEnabled(enabled: boolean): void {
    localStorage.setItem('autoSavePrompts', enabled.toString());
  }
}