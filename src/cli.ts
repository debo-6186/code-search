#!/usr/bin/env node

import plugin from './index';

async function main() {
  const args = process.argv.slice(2);
  const query = args.join(' ');

  if (!query) {
    console.error('Please provide a search query');
    process.exit(1);
  }

  try {
    const results = await plugin.search(query, process.cwd());
    console.log('\nSearch Results:\n');
    console.log(plugin.formatResults(results));
  } catch (error) {
    console.error('Error performing search:', error);
    process.exit(1);
  }
}

main(); 