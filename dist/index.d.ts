interface SearchResult {
    filePath: string;
    content: string;
    lineNumber: number;
    score: number;
}
declare class CodeSearchPlugin {
    private tokenizer;
    private tfidf;
    constructor();
    search(query: string, workspacePath: string): Promise<SearchResult[]>;
    private findFiles;
    private readFile;
    private findMatches;
    formatResults(results: SearchResult[]): string;
}
declare const _default: CodeSearchPlugin;
export default _default;
