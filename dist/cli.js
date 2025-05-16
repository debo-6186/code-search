#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
async function main() {
    const args = process.argv.slice(2);
    const query = args.join(' ');
    if (!query) {
        console.error('Please provide a search query');
        process.exit(1);
    }
    try {
        const results = await index_1.default.search(query, process.cwd());
        console.log('\nSearch Results:\n');
        console.log(index_1.default.formatResults(results));
    }
    catch (error) {
        console.error('Error performing search:', error);
        process.exit(1);
    }
}
main();
