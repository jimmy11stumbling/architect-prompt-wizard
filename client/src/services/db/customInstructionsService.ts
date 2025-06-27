
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type CustomInstructionRow = Database['public']['Tables']['custom_instructions']['Row'];
type CustomInstructionInsert = Database['public']['Tables']['custom_instructions']['Insert'];
type CustomInstructionUpdate = Database['public']['Tables']['custom_instructions']['Update'];

export interface CustomInstruction {
  id?: string;
  name: string;
  instructionText: string;
  description?: string;
  category?: string;
  isGlobal?: boolean;
  isActive?: boolean;
  priority?: number;
  appliesTo?: string[];
  createdAt?: string;
  updatedAt?: string;
}

class CustomInstructionsService {
  private convertFromDb(row: CustomInstructionRow): CustomInstruction {
    return {
      id: row.id,
      name: row.name,
      instructionText: row.instruction_text,
      description: row.description || undefined,
      category: row.category || 'general',
      isGlobal: row.is_global || false,
      isActive: row.is_active || true,
      priority: row.priority || 0,
      appliesTo: row.applies_to || [],
      createdAt: row.created_at || undefined,
      updatedAt: row.updated_at || undefined
    };
  }

  private convertToDb(instruction: Partial<CustomInstruction>): Partial<CustomInstructionInsert> {
    return {
      name: instruction.name,
      instruction_text: instruction.instructionText,
      description: instruction.description,
      category: instruction.category,
      is_global: instruction.isGlobal,
      is_active: instruction.isActive,
      priority: instruction.priority,
      applies_to: instruction.appliesTo
    };
  }

  async createInstruction(instruction: CustomInstruction): Promise<CustomInstruction> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be authenticated to create custom instructions');
    }

    const insertData: CustomInstructionInsert = {
      ...this.convertToDb(instruction),
      user_id: user.data.user.id
    } as CustomInstructionInsert;

    const { data, error } = await supabase
      .from('custom_instructions')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.convertFromDb(data);
  }

  async getAllInstructions(): Promise<CustomInstruction[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('custom_instructions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async getActiveInstructions(): Promise<CustomInstruction[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('custom_instructions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async getInstructionsByCategory(category: string): Promise<CustomInstruction[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('custom_instructions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('category', category)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async updateInstruction(id: string, updates: Partial<CustomInstruction>): Promise<CustomInstruction | null> {
    const updateData: CustomInstructionUpdate = this.convertToDb(updates) as CustomInstructionUpdate;

    const { data, error } = await supabase
      .from('custom_instructions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data ? this.convertFromDb(data) : null;
  }

  async deleteInstruction(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_instructions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async toggleActive(id: string): Promise<CustomInstruction | null> {
    const { data: current, error: fetchError } = await supabase
      .from('custom_instructions')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('custom_instructions')
      .update({ is_active: !current.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data ? this.convertFromDb(data) : null;
  }
}

export const customInstructionsService = new CustomInstructionsService();
