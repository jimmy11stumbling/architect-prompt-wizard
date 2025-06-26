
export class KeywordMatcher {
  private keywordIndex: Map<string, Set<string>> = new Map();

  buildIndex(chunks: Array<{ id: string; text: string }>) {
    this.keywordIndex.clear();
    
    chunks.forEach(chunk => {
      const words = this.extractKeywords(chunk.text);
      words.forEach(word => {
        if (!this.keywordIndex.has(word)) {
          this.keywordIndex.set(word, new Set());
        }
        this.keywordIndex.get(word)!.add(chunk.id);
      });
    });
  }

  calculateScore(queryKeywords: string[], text: string): number {
    const textKeywords = this.extractKeywords(text);
    const matches = queryKeywords.filter(qw => textKeywords.includes(qw));
    
    if (queryKeywords.length === 0) return 0;
    
    const termFrequency = matches.length / queryKeywords.length;
    const uniqueMatches = new Set(matches).size;
    
    return (termFrequency * 0.7) + (uniqueMatches / queryKeywords.length * 0.3);
  }

  getMatchingKeywords(queryKeywords: string[], text: string): string[] {
    const textKeywords = new Set(this.extractKeywords(text));
    return queryKeywords.filter(qw => textKeywords.has(qw));
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .map(word => this.stemWord(word));
  }

  private stemWord(word: string): string {
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment'];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.substring(0, word.length - suffix.length);
      }
    }
    
    return word;
  }
}
