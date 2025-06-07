
export interface SavedPrompt {
  id?: number;
  projectName: string;
  prompt: string;
  timestamp: number;
  tags?: string[];
}

class PromptDatabaseService {
  private prompts: SavedPrompt[] = [];
  private nextId = 1;

  async savePrompt(prompt: SavedPrompt): Promise<SavedPrompt> {
    const savedPrompt = {
      ...prompt,
      id: this.nextId++,
      timestamp: prompt.timestamp || Date.now()
    };
    this.prompts.push(savedPrompt);
    return savedPrompt;
  }

  async getAllPrompts(): Promise<SavedPrompt[]> {
    return [...this.prompts];
  }

  async deletePrompt(id: number): Promise<void> {
    const index = this.prompts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.prompts.splice(index, 1);
    }
  }

  async getPromptById(id: number): Promise<SavedPrompt | null> {
    return this.prompts.find(p => p.id === id) || null;
  }
}

const promptDatabaseService = new PromptDatabaseService();

export { promptDatabaseService };
export type { SavedPrompt as default };
export const { savePrompt, getAllPrompts, deletePrompt, getPromptById } = promptDatabaseService;
