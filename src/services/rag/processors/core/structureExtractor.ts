
export interface DocumentStructure {
  headings: string[];
  tables: string[];
  codeBlocks: string[];
  sections: Array<{
    heading: string;
    content: string;
    level: number;
  }>;
}

export class StructureExtractor {
  static async extractStructure(content: string): Promise<DocumentStructure> {
    const headings = this.extractHeadings(content);
    const tables = this.extractTables(content);
    const codeBlocks = this.extractCodeBlocks(content);
    
    return {
      headings,
      tables,
      codeBlocks,
      sections: this.identifySections(content, headings)
    };
  }

  private static extractHeadings(content: string): string[] {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const headings: string[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push(match[1].trim());
    }
    
    return headings;
  }

  private static extractTables(content: string): string[] {
    const tableRegex = /\|.*\|/gm;
    const tables: string[] = [];
    const lines = content.split('\n');
    
    let currentTable: string[] = [];
    
    for (const line of lines) {
      if (tableRegex.test(line)) {
        currentTable.push(line);
      } else if (currentTable.length > 0) {
        tables.push(currentTable.join('\n'));
        currentTable = [];
      }
    }
    
    if (currentTable.length > 0) {
      tables.push(currentTable.join('\n'));
    }
    
    return tables;
  }

  private static extractCodeBlocks(content: string): string[] {
    const codeBlockRegex = /```[\s\S]*?```/g;
    return content.match(codeBlockRegex) || [];
  }

  private static identifySections(content: string, headings: string[]) {
    const sections: Array<{heading: string, content: string, level: number}> = [];
    
    headings.forEach((heading) => {
      const level = content.match(new RegExp(`^(#{1,6})\\s+${heading}`, 'm'))?.[1].length || 1;
      sections.push({ heading, content: '', level });
    });
    
    return sections;
  }
}
