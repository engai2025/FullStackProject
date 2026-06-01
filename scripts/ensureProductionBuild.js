import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distIndex = path.join(rootDir, 'frontend/dist/index.html');
const frontendModules = path.join(rootDir, 'frontend/node_modules/vite');

const isProductionRender = process.env.NODE_ENV === 'production' && process.env.RENDER === 'true';

if (!isProductionRender) {
    process.exit(0);
}

const needsBuild = () => {
    if (!fs.existsSync(distIndex)) return true;

    const html = fs.readFileSync(distIndex, 'utf8');
    if (html.includes('Task Manager') || html.includes('Task Dashboard')) return true;
    if (!html.includes('Expense Tracker')) return true;

    const assetsDir = path.join(rootDir, 'frontend/dist/assets');
    if (!fs.existsSync(assetsDir)) return true;

    const jsFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.js'));
    if (!jsFile) return true;

    const bundle = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
    return bundle.includes('Task Dashboard') || bundle.includes('Create New Task') || !bundle.includes('Expense Tracker');
};

if (needsBuild()) {
    console.log('🔨 Building Expense Tracker frontend for Render production...');

    if (!fs.existsSync(frontendModules)) {
        execSync('npm install --prefix frontend --include=dev', { cwd: rootDir, stdio: 'inherit' });
    }

    execSync('npm run build --prefix frontend', { cwd: rootDir, stdio: 'inherit' });
    execSync('node scripts/verifyExpenseBuild.js', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ Expense Tracker frontend ready');
}
