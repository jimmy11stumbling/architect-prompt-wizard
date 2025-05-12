
import { GenerationStatus } from "@/types/ipa-types";

// Database configuration
const DB_NAME = "intelligent_prompt_architect";
const DB_VERSION = 1;
const PROMPTS_STORE = "saved_prompts";

// Prompt record interface for storage
export interface SavedPrompt {
  id?: number;
  timestamp: number;
  projectName: string;
  prompt: string;
  spec: object;
  agentOutputs?: Record<string, string>;
  tags?: string[];
}

/**
 * Initialize the database and create object stores
 */
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("Database error:", event);
      reject("Could not open prompt database");
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the prompts object store with auto-incrementing id
      if (!db.objectStoreNames.contains(PROMPTS_STORE)) {
        const store = db.createObjectStore(PROMPTS_STORE, { keyPath: "id", autoIncrement: true });
        
        // Create indexes for faster querying
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("projectName", "projectName", { unique: false });
        
        console.log("Database setup complete");
      }
    };
  });
};

/**
 * Save a generated prompt to the database
 */
export const savePrompt = async (status: GenerationStatus, projectName: string = "Unnamed Project"): Promise<number> => {
  if (!status.result) {
    throw new Error("No prompt to save");
  }
  
  // Extract agent outputs for searchable storage
  const agentOutputs: Record<string, string> = {};
  status.agents.forEach(agent => {
    if (agent.output) {
      agentOutputs[agent.agent] = agent.output;
    }
  });
  
  const promptRecord: SavedPrompt = {
    timestamp: Date.now(),
    projectName,
    prompt: status.result,
    spec: status.spec || {},
    agentOutputs,
    tags: extractTags(status.result)
  };
  
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction([PROMPTS_STORE], "readwrite");
      const store = transaction.objectStore(PROMPTS_STORE);
      const request = store.add(promptRecord);
      
      request.onsuccess = () => {
        resolve(request.result as number);
      };
      
      request.onerror = (event) => {
        console.error("Error saving prompt:", event);
        reject("Failed to save prompt to database");
      };
    }).catch(reject);
  });
};

/**
 * Get all saved prompts from the database
 */
export const getAllPrompts = async (): Promise<SavedPrompt[]> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction([PROMPTS_STORE], "readonly");
      const store = transaction.objectStore(PROMPTS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error("Error retrieving prompts:", event);
        reject("Failed to get prompts from database");
      };
    }).catch(reject);
  });
};

/**
 * Get a specific prompt by ID
 */
export const getPromptById = async (id: number): Promise<SavedPrompt> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction([PROMPTS_STORE], "readonly");
      const store = transaction.objectStore(PROMPTS_STORE);
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          reject(`Prompt with ID ${id} not found`);
        }
      };
      
      request.onerror = (event) => {
        console.error("Error retrieving prompt:", event);
        reject("Failed to get prompt from database");
      };
    }).catch(reject);
  });
};

/**
 * Delete a prompt by ID
 */
export const deletePrompt = async (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction([PROMPTS_STORE], "readwrite");
      const store = transaction.objectStore(PROMPTS_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error("Error deleting prompt:", event);
        reject("Failed to delete prompt from database");
      };
    }).catch(reject);
  });
};

/**
 * Search prompts by text content
 */
export const searchPrompts = async (searchTerm: string): Promise<SavedPrompt[]> => {
  const allPrompts = await getAllPrompts();
  const searchTermLower = searchTerm.toLowerCase();
  
  return allPrompts.filter(prompt => 
    prompt.prompt.toLowerCase().includes(searchTermLower) || 
    prompt.projectName.toLowerCase().includes(searchTermLower) ||
    Object.values(prompt.agentOutputs || {}).some(output => 
      output.toLowerCase().includes(searchTermLower)
    ) ||
    (prompt.tags || []).some(tag => 
      tag.toLowerCase().includes(searchTermLower)
    )
  );
};

/**
 * Extract potential tags from the prompt content
 */
const extractTags = (promptText: string): string[] => {
  // Extract technologies mentioned in the prompt
  const techPatterns = [
    /React/gi, /Next\.js/gi, /Vue/gi, /Angular/gi, /Express/gi, 
    /NestJS/gi, /FastAPI/gi, /Django/gi, /PostgreSQL/gi, /MongoDB/gi, 
    /Redis/gi, /Docker/gi, /RAG/gi, /MCP/gi, /A2A/gi, /Agent/gi
  ];
  
  const tags = new Set<string>();
  
  // Extract tech mentions
  techPatterns.forEach(pattern => {
    const matches = promptText.match(pattern);
    if (matches) {
      matches.forEach(match => tags.add(match));
    }
  });
  
  // Try to extract any ## headers as potential tags
  const headerMatches = promptText.match(/##\s+([^\n]+)/g);
  if (headerMatches) {
    headerMatches.forEach(header => {
      tags.add(header.replace(/^##\s+/, '').trim());
    });
  }
  
  return Array.from(tags);
};

