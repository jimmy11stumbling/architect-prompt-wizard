import { Router } from 'express';
import { db } from '../db';
import { savedPrompts, users } from '../../shared/schema';
import { eq, desc, and, or, like, gte } from 'drizzle-orm';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const promptSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  prompt: z.string().min(1),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

const updatePromptSchema = promptSchema.partial();

// Get all prompts for authenticated user
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const prompts = await db
      .select()
      .from(savedPrompts)
      .where(eq(savedPrompts.userId, req.user.id))
      .orderBy(desc(savedPrompts.updatedAt));

    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get public prompts
router.get('/public', async (req, res) => {
  try {
    const prompts = await db
      .select()
      .from(savedPrompts)
      .where(eq(savedPrompts.isPublic, true))
      .orderBy(desc(savedPrompts.updatedAt));

    res.json(prompts);
  } catch (error) {
    console.error('Error fetching public prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured prompts (public prompts with high usage)
router.get('/featured', async (req, res) => {
  try {
    const prompts = await db
      .select()
      .from(savedPrompts)
      .where(eq(savedPrompts.isPublic, true))
      .orderBy(desc(savedPrompts.updatedAt))
      .limit(6);

    res.json(prompts);
  } catch (error) {
    console.error('Error fetching featured prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search prompts
router.get('/search', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const prompts = await db
      .select()
      .from(savedPrompts)
      .where(
        and(
          eq(savedPrompts.userId, req.user.id),
          or(
            like(savedPrompts.title, `%${q}%`),
            like(savedPrompts.description, `%${q}%`),
            like(savedPrompts.prompt, `%${q}%`)
          )
        )
      )
      .orderBy(desc(savedPrompts.updatedAt));

    res.json(prompts);
  } catch (error) {
    console.error('Error searching prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single prompt by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const promptId = parseInt(id);
    if (isNaN(promptId)) {
      return res.status(400).json({ error: "Invalid prompt ID" });
    }

    const prompt = await db
      .select()
      .from(savedPrompts)
      .where(eq(savedPrompts.id, promptId))
      .limit(1);

    if (prompt.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Check if user has access to this prompt
    const promptData = prompt[0];
    if (!promptData.isPublic && (!req.user || promptData.userId !== req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(promptData);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new prompt
router.post('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = promptSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues });
    }

    const promptData = validation.data;

    // Ensure user exists, create if not
    const existingUser = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: req.user.id,
        email: `user${req.user.id}@example.com`,
        name: `User ${req.user.id}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const newPrompt = await db
      .insert(savedPrompts)
      .values({
        ...promptData,
        userId: req.user.id,
        tags: promptData.tags || [],
        isPublic: promptData.isPublic || false,
      })
      .returning();

    res.status(201).json(newPrompt[0]);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update prompt
router.put('/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const validation = updatePromptSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues });
    }

    const updateData = validation.data;

    const updatedPrompt = await db
      .update(savedPrompts)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(savedPrompts.id, parseInt(id)),
          eq(savedPrompts.userId, req.user.id)
        )
      )
      .returning();

    if (updatedPrompt.length === 0) {
      return res.status(404).json({ error: 'Prompt not found or access denied' });
    }

    res.json(updatedPrompt[0]);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete prompt
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const deletedPrompt = await db
      .delete(savedPrompts)
      .where(
        and(
          eq(savedPrompts.id, parseInt(id)),
          eq(savedPrompts.userId, req.user.id)
        )
      )
      .returning();

    if (deletedPrompt.length === 0) {
      return res.status(404).json({ error: 'Prompt not found or access denied' });
    }

    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get prompt statistics
router.get('/stats', async (req, res) => {
  try {
    // Use default user ID if not provided (since this is a personal app)
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;

    const stats = await db.query(
      `SELECT 
        COUNT(*) as total_prompts,
        COUNT(CASE WHEN is_public = true THEN 1 END) as public_prompts,
        COUNT(DISTINCT category) as categories,
        COALESCE(SUM(usage), 0) as total_usage,
        COALESCE(AVG(rating), 0) as average_rating
      FROM saved_prompts 
      WHERE userId = $1`,
      [userId]
    );

    // Ensure all numeric values are valid
    const sanitizedStats = {
      total_prompts: isNaN(Number(stats[0].total_prompts)) ? 0 : Number(stats[0].total_prompts),
      public_prompts: isNaN(Number(stats[0].public_prompts)) ? 0 : Number(stats[0].public_prompts),
      categories: isNaN(Number(stats[0].categories)) ? 0 : Number(stats[0].categories),
      total_usage: isNaN(Number(stats[0].total_usage)) ? 0 : Number(stats[0].total_usage),
      average_rating: isNaN(Number(stats[0].average_rating)) ? 0 : Number(stats[0].average_rating
      )
    };

    res.json(sanitizedStats);
  } catch (error) {
    console.error('Error fetching prompt stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;