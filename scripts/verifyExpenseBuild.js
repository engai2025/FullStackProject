import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../frontend/dist/assets');
const indexHtml = path.join(__dirname, '../frontend/dist/index.html');

if (!fs.existsSync(indexHtml)) {
    console.error('❌ frontend/dist not found. Run npm run build --prefix frontend first.');
    process.exit(1);
}

const html = fs.readFileSync(indexHtml, 'utf8');
if (html.includes('Task Manager') || html.includes('Task Dashboard')) {
    console.error('❌ Build still contains Task Manager UI. Expense Tracker build required.');
    process.exit(1);
}

const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
const bundle = fs.readFileSync(path.join(distDir, jsFiles[0]), 'utf8');

if (bundle.includes('Task Dashboard') || bundle.includes('Create New Task') || bundle.includes('Search tasks')) {
    console.error('❌ JS bundle still contains task UI strings.');
    process.exit(1);
}

if (!bundle.includes('Expense Tracker') && !bundle.includes('Add Expense')) {
    console.error('❌ JS bundle missing Expense Tracker UI.');
    process.exit(1);
}

console.log('✅ Expense Tracker frontend build verified');
