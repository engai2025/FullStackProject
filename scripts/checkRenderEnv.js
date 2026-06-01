import dotenv from 'dotenv';
import fs from 'fs';

const secretEnvPath = '/etc/secrets/.env';
if (fs.existsSync(secretEnvPath)) {
    dotenv.config({ path: secretEnvPath });
}
dotenv.config();

const DB_NAME = 'expense-manager';

const getDbNameFromUri = (uri) => {
    if (!uri) return null;

    const withoutQuery = uri.split('?')[0];
    const afterCredentials = withoutQuery.includes('@')
        ? withoutQuery.split('@')[1]
        : withoutQuery.replace(/^mongodb(\+srv)?:\/\//, '');

    const segments = afterCredentials.split('/').filter(Boolean);
    return segments.length > 1 ? segments[segments.length - 1] : null;
};

if (process.env.RENDER === 'true' && !process.env.MONGO_URI_PRO && !process.env.MONGO_URI) {
    console.error('');
    console.error('❌ MONGO_URI_PRO is missing on Render!');
    console.error('');
    console.error('Render → Environment → MONGO_URI_PRO =');
    console.error(`mongodb+srv://engai2025_db_user:YOUR_PASSWORD@cluster0.0avphrx.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&authSource=admin&appName=Cluster0`);
    console.error('');
    process.exit(1);
}

if (process.env.RENDER === 'true') {
    const uri = process.env.MONGO_URI_PRO || process.env.MONGO_URI || '';
    const dbName = getDbNameFromUri(uri);

    if (dbName && dbName !== DB_NAME) {
        console.warn('');
        console.warn(`⚠️  MONGO_URI_PRO uses database "${dbName}" — recommended: "${DB_NAME}"`);
        console.warn('   Update Render Environment so production uses expense-manager.');
        console.warn('');
    }
}
