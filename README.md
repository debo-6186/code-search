# Code Search Plugin

A semantic code search tool that helps you find relevant code sections in your TypeScript/JavaScript codebase using natural language processing.

## Features

- Semantic code search across your TypeScript/JavaScript codebase
- Natural language processing for better search results
- TF-IDF based relevance scoring
- Command-line interface for easy use
- Support for TypeScript and JavaScript files

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. Link the package globally (optional):
   ```bash
   npm link
   ```

## Usage

### Command Line

You can use the tool directly from the command line:

```bash
# Using npm script
npm start -- "your search query"

# Or if linked globally
code-search "your search query"
```

### Programmatic Usage

You can also use the plugin programmatically in your code:

```typescript
import plugin from 'cursor-code-search-plugin';

async function search() {
  const results = await plugin.search('your search query', process.cwd());
  console.log(plugin.formatResults(results));
}
```

## How it Works

The plugin uses natural language processing techniques to find relevant code:

1. Tokenizes both the search query and code content
2. Uses TF-IDF (Term Frequency-Inverse Document Frequency) for relevance scoring
3. Combines word overlap and TF-IDF scores for better results
4. Ranks results by relevance score

## Development

- `npm run build` - Build the plugin
- `npm run watch` - Watch for changes and rebuild automatically
- `npm test` - Run tests
- `npm start -- "query"` - Run the search tool

## License

MIT
