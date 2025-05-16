"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const natural = __importStar(require("natural"));
const glob_1 = require("glob");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CodeSearchPlugin {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.tfidf = new natural.TfIdf();
    }
    async search(query, workspacePath) {
        // Get all TypeScript/JavaScript files in the workspace
        const files = await this.findFiles(workspacePath);
        const results = [];
        // Process each file
        for (const file of files) {
            const content = await this.readFile(file);
            if (!content)
                continue;
            // Add document to TF-IDF
            this.tfidf.addDocument(content);
            // Find matches in the file
            const matches = this.findMatches(content, query, file);
            results.push(...matches);
        }
        // Sort results by relevance score
        return results.sort((a, b) => b.score - a.score);
    }
    async findFiles(workspacePath) {
        try {
            const files = await (0, glob_1.glob)('**/*.{ts,tsx,js,jsx}', {
                cwd: workspacePath,
                ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
                absolute: true
            });
            return files;
        }
        catch (error) {
            console.error('Error finding files:', error);
            return [];
        }
    }
    async readFile(filePath) {
        try {
            return await fs.promises.readFile(filePath, 'utf-8');
        }
        catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return null;
        }
    }
    findMatches(content, query, filePath) {
        const matches = [];
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
    formatResults(results) {
        return results.map(result => {
            const relativePath = path.relative(process.cwd(), result.filePath);
            return `${relativePath}:${result.lineNumber}\n${result.content}\nScore: ${result.score.toFixed(2)}\n`;
        }).join('\n');
    }
}
// Export a singleton instance
exports.default = new CodeSearchPlugin();
