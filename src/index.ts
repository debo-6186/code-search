import * as natural from 'natural';
import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

interface SearchResult {
  filePath: string;
  content: string;
  lineNumber: number;
  score: number;
}

class CodeSearchPlugin {
  private tokenizer: natural.WordTokenizer;
  private tfidf: natural.TfIdf;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  async search(query: string, workspacePath: string): Promise<SearchResult[]> {
    // Get all TypeScript/JavaScript files in the workspace
    const files = await this.findFiles(workspacePath);
    const results: SearchResult[] = [];

    // Process each file
    for (const file of files) {
      const content = await this.readFile(file);
      if (!content) continue;

      // Add document to TF-IDF
      this.tfidf.addDocument(content);

      // Find matches in the file
      const matches = this.findMatches(content, query, file);
      results.push(...matches);
    }

    // Sort results by relevance score
    return results.sort((a, b) => b.score - a.score);
  }

  private async findFiles(workspacePath: string): Promise<string[]> {
    try {
      const files = await glob('**/*.{ts,tsx,js,jsx}', {
        cwd: workspacePath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
        absolute: true
      });
      return files;
    } catch (error) {
      console.error('Error finding files:', error);
      return [];
    }
  }

  private async readFile(filePath: string): Promise<string | null> {
    try {
      return await fs.promises.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return null;
    }
  }

  private findMatches(content: string, query: string, filePath: string): SearchResult[] {
    const matches: SearchResult[] = [];
    const lines = content.split('\n');
    
    // Tokenize query and handle null case
    const queryTokens = this.tokenizer.tokenize(query.toLowerCase()) || [];
    
    // Create a TF-IDF instance for this file
    const fileTfidf = new natural.TfIdf();
    fileTfidf.addDocument(content);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Tokenize line and handle null case
      const lineTokens = this.tokenizer.tokenize(line.toLowerCase()) || [];
      
      // Calculate semantic similarity score
      let score = 0;
      
      // Word overlap score
      for (const token of queryTokens) {
        if (lineTokens.includes(token)) {
          score += 1;
        }
      }

      // TF-IDF score
      const tfidfScore = queryTokens.reduce((sum, token) => {
        return sum + (fileTfidf.tfidf(token, 0) || 0);
      }, 0);

      // Combine scores
      const finalScore = (score * 0.7) + (tfidfScore * 0.3);

      if (finalScore > 0) {
        matches.push({
          filePath,
          content: line.trim(),
          lineNumber: i + 1,
          score: finalScore
        });
      }
    }

    return matches;
  }

  // Method to format results for display
  formatResults(results: SearchResult[]): string {
    return results.map(result => {
      const relativePath = path.relative(process.cwd(), result.filePath);
      return `${relativePath}:${result.lineNumber}\n${result.content}\nScore: ${result.score.toFixed(2)}\n`;
    }).join('\n');
  }
}

// Export a singleton instance
export default new CodeSearchPlugin(); 