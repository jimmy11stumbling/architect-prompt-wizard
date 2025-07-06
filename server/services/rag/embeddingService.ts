import { encode } from 'js-tiktoken';
import natural from 'natural';
import stringSimilarity from 'string-similarity';

export interface EmbeddingOptions {
  model?: 'local-tfidf' | 'openai' | 'cohere';
  dimensions?: number;
  maxTokens?: number;
}

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
  model: string;
}

export class EmbeddingService {
  private static instance: EmbeddingService;
  private tfidfVectorizer: natural.TfIdf;
  private vocabulary: Map<string, number> = new Map();
  private initialized = false;

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  constructor() {
    this.tfidfVectorizer = new natural.TfIdf();
  }

  async initialize(documents: string[] = []): Promise<void> {
    if (this.initialized) return;

    try {
      // Build vocabulary from all documents
      for (const doc of documents) {
        const tokens = this.tokenizeText(doc);
        this.tfidfVectorizer.addDocument(tokens);
        
        // Build vocabulary mapping
        tokens.forEach(token => {
          if (!this.vocabulary.has(token)) {
            this.vocabulary.set(token, this.vocabulary.size);
          }
        });
      }

      this.initialized = true;
      console.log(`Embedding service initialized with vocabulary size: ${this.vocabulary.size}`);
    } catch (error) {
      console.error('Failed to initialize embedding service:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string, options: EmbeddingOptions = {}): Promise<EmbeddingResult> {
    const { model = 'local-tfidf', dimensions = 1536 } = options;

    switch (model) {
      case 'local-tfidf':
        return this.generateTFIDFEmbedding(text, dimensions);
      case 'openai':
        return this.generateOpenAIEmbedding(text);
      case 'cohere':
        return this.generateCohereEmbedding(text);
      default:
        throw new Error(`Unsupported embedding model: ${model}`);
    }
  }

  private async generateTFIDFEmbedding(text: string, targetDimensions: number): Promise<EmbeddingResult> {
    try {
      const tokens = this.tokenizeText(text);
      const tokenCount = this.countTokens(text);

      // Calculate TF-IDF scores
      const tfidfScores = new Map<string, number>();
      
      // Add document to vectorizer temporarily to get TF-IDF scores
      const docIndex = this.tfidfVectorizer.documents.length;
      this.tfidfVectorizer.addDocument(tokens);

      // Get TF-IDF values for each term
      tokens.forEach(token => {
        const tfidf = this.tfidfVectorizer.tfidf(token, docIndex);
        if (tfidf > 0) {
          tfidfScores.set(token, tfidf);
        }
      });

      // Remove the temporary document
      this.tfidfVectorizer.documents.pop();

      // Create sparse vector from TF-IDF scores
      const sparseVector = new Array(this.vocabulary.size).fill(0);
      tfidfScores.forEach((score, token) => {
        const index = this.vocabulary.get(token);
        if (index !== undefined) {
          sparseVector[index] = score;
        }
      });

      // Pad or truncate to target dimensions
      let embedding: number[];
      if (sparseVector.length < targetDimensions) {
        // Pad with zeros and add some randomness to reach target dimensions
        embedding = [...sparseVector];
        while (embedding.length < targetDimensions) {
          embedding.push(Math.random() * 0.1 - 0.05); // Small random values
        }
      } else {
        // Use PCA-like dimension reduction (simplified)
        embedding = this.reduceDimensions(sparseVector, targetDimensions);
      }

      // Normalize the vector
      embedding = this.normalizeVector(embedding);

      return {
        embedding,
        tokens: tokenCount,
        model: 'local-tfidf'
      };
    } catch (error) {
      console.error('Failed to generate TF-IDF embedding:', error);
      throw error;
    }
  }

  private async generateOpenAIEmbedding(text: string): Promise<EmbeddingResult> {
    // This would integrate with OpenAI API if available
    // For now, fall back to TF-IDF
    console.log('OpenAI embeddings not configured, falling back to TF-IDF');
    return this.generateTFIDFEmbedding(text, 1536);
  }

  private async generateCohereEmbedding(text: string): Promise<EmbeddingResult> {
    // This would integrate with Cohere API if available
    // For now, fall back to TF-IDF
    console.log('Cohere embeddings not configured, falling back to TF-IDF');
    return this.generateTFIDFEmbedding(text, 1536);
  }

  private tokenizeText(text: string): string[] {
    // Advanced tokenization with stemming and stopword removal
    const tokenizer = new natural.WordTokenizer();
    const stemmer = natural.PorterStemmer;
    
    let tokens = tokenizer.tokenize(text.toLowerCase()) || [];
    
    // Remove stopwords
    tokens = tokens.filter(token => 
      !natural.stopwords.includes(token) && 
      token.length > 2 && 
      /^[a-zA-Z]+$/.test(token)
    );
    
    // Apply stemming
    tokens = tokens.map(token => stemmer.stem(token));
    
    return tokens;
  }

  private countTokens(text: string): number {
    try {
      return encode(text).length;
    } catch (error) {
      // Fallback to word count if tiktoken fails
      return text.split(/\s+/).length;
    }
  }

  private reduceDimensions(vector: number[], targetDim: number): number[] {
    // Simplified dimension reduction using random projection
    const chunkSize = Math.ceil(vector.length / targetDim);
    const reduced: number[] = [];

    for (let i = 0; i < targetDim; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, vector.length);
      const chunk = vector.slice(start, end);
      const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
      reduced.push(avg || 0);
    }

    return reduced;
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }

  async generateBatchEmbeddings(texts: string[], options: EmbeddingOptions = {}): Promise<EmbeddingResult[]> {
    const embeddings: EmbeddingResult[] = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text, options);
        embeddings.push(embedding);
      } catch (error) {
        console.error(`Failed to generate embedding for text: ${text.substring(0, 100)}...`, error);
        // Generate a zero vector as fallback
        embeddings.push({
          embedding: new Array(options.dimensions || 1536).fill(0),
          tokens: 0,
          model: 'fallback'
        });
      }
    }

    return embeddings;
  }

  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    // Calculate cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  async updateVocabulary(newDocuments: string[]): Promise<void> {
    // Update vocabulary with new documents
    for (const doc of newDocuments) {
      const tokens = this.tokenizeText(doc);
      this.tfidfVectorizer.addDocument(tokens);
      
      tokens.forEach(token => {
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, this.vocabulary.size);
        }
      });
    }

    console.log(`Updated vocabulary to size: ${this.vocabulary.size}`);
  }

  getVocabularyStats(): { size: number; topTerms: string[] } {
    const topTerms = Array.from(this.vocabulary.keys()).slice(0, 50);
    return {
      size: this.vocabulary.size,
      topTerms
    };
  }
}