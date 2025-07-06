// Migrated to use localStorage for now, can be enhanced with API later
export interface CustomInstruction {
  id: string;
  name: string;
  instruction_text: string;
  description?: string;
  category: string;
  is_global: boolean;
  is_active: boolean;
  priority: number;
  applies_to: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

class CustomInstructionsService {
  private getStorageKey(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return `custom_instructions_${user.id || 'anonymous'}`;
  }

  private getInstructions(): CustomInstruction[] {
    const data = localStorage.getItem(this.getStorageKey());
    return data ? JSON.parse(data) : [];
  }

  private saveInstructions(instructions: CustomInstruction[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(instructions));
  }

  async getAllInstructions(): Promise<CustomInstruction[]> {
    return this.getInstructions();
  }

  async getActiveInstructions(): Promise<CustomInstruction[]> {
    const instructions = this.getInstructions();
    return instructions.filter(inst => inst.is_active);
  }

  async getGlobalInstructions(): Promise<CustomInstruction[]> {
    const instructions = this.getInstructions();
    return instructions.filter(inst => inst.is_global && inst.is_active);
  }

  async getInstructionsByCategory(category: string): Promise<CustomInstruction[]> {
    const instructions = this.getInstructions();
    return instructions.filter(inst => inst.category === category && inst.is_active);
  }

  async saveInstruction(instruction: Omit<CustomInstruction, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<CustomInstruction> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const instructions = this.getInstructions();
    
    const newInstruction: CustomInstruction = {
      ...instruction,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user.id?.toString() || 'anonymous',
    };

    instructions.push(newInstruction);
    this.saveInstructions(instructions);
    
    return newInstruction;
  }

  async updateInstruction(id: string, updates: Partial<CustomInstruction>): Promise<CustomInstruction | null> {
    const instructions = this.getInstructions();
    const index = instructions.findIndex(inst => inst.id === id);
    
    if (index === -1) return null;

    instructions[index] = {
      ...instructions[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveInstructions(instructions);
    return instructions[index];
  }

  async deleteInstruction(id: string): Promise<void> {
    const instructions = this.getInstructions();
    const filtered = instructions.filter(inst => inst.id !== id);
    this.saveInstructions(filtered);
  }

  async toggleInstruction(id: string): Promise<CustomInstruction | null> {
    const instructions = this.getInstructions();
    const instruction = instructions.find(inst => inst.id === id);
    
    if (!instruction) return null;

    return this.updateInstruction(id, { is_active: !instruction.is_active });
  }

  async getApplicableInstructions(context: string[]): Promise<CustomInstruction[]> {
    const instructions = this.getInstructions();
    return instructions.filter(inst => 
      inst.is_active && (
        inst.is_global || 
        inst.applies_to.some(rule => context.includes(rule))
      )
    ).sort((a, b) => b.priority - a.priority);
  }
}

export const customInstructionsService = new CustomInstructionsService();