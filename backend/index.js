import express from 'express';
import helmet from 'helmet';

import path from 'path';
import { fileURLToPath } from 'url';

import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import expensesRoute from './routes/expenses.js';
import uploadRoutes from './routes/upload.js';
import userRoutes from './routes/users.js';

import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { connectDB, getMongoUri, getConnectionStatus, getPublicConnectionHint } from './utils/connectDB.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notfound.js';
import { dbCheck } from './middlewares/dbCheck.js';

const secretEnvPath = '/etc/secrets/.env';
if (fs.existsSync(secretEnvPath)) {
    dotenv.config({ path: secretEnvPath });
}
dotenv.config();

import swaggerUi from 'swagger-ui-express';
import { limiter } from './middlewares/rateLimiter.js';
import { swaggerSpec } from './utils/swagger.js';


const app = express();
const PORT = process.env.PORT || 5000

const corsOrigins = [
    "http://localhost:5173",
    "https://dugsiiye.com",
    "https://fullstackproject-vrds.onrender.com",
];

if (process.env.FRONTEND_URL) {
    corsOrigins.push(process.env.FRONTEND_URL);
}

const connectSrc = ["'self'"];

for (const url of [process.env.API_PUBLIC_URL, process.env.VITE_API_URL]) {
    if (!url) continue;
    try {
        connectSrc.push(new URL(url).origin);
    } catch {
        // ignore invalid URLs
    }
}

connectSrc.push(
    "http://localhost:5000",
    "https://mentorship-api-jys6.onrender.com",
    "https://mentorship-api-iyse.onrender.com",
    "https://fullstackproject-vrds.onrender.com"
);

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        `default-src 'self'; connect-src ${connectSrc.join(" ")}; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:;`
    );
    next();
});
app.use(express.json());

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (corsOrigins.includes(origin)) return callback(null, true);
        if (origin.endsWith(".onrender.com")) return callback(null, true);
        if (process.env.NODE_ENV === "development" && /^http:\/\/localhost:\d+$/.test(origin)) {
            return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
    },
}))

app.use(limiter);


if (process.env.NODE_ENV == "development") {
    app.use(morgan('dev'))
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// routes middleware

// diiwan gelin routes
app.use('/api/users', dbCheck, userRoutes);
app.use('/api/auth', dbCheck, authRoutes);
app.use('/api/admin', dbCheck, adminRoutes);
app.use('/api/upload', dbCheck, uploadRoutes);
app.use('/api/expenses', dbCheck, expensesRoute);

app.get('/api/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    const { host } = getConnectionStatus();

    res.json({
        server: "Server is working... 😊",
        app: "expense-tracker",
        database: dbConnected ? "connected" : "disconnected",
        dbName: dbConnected ? mongoose.connection.name : null,
        mongoConfigured: !!getMongoUri(),
        cluster: host,
        onRender: process.env.RENDER === "true",
        nodeEnv: process.env.NODE_ENV,
        ...(dbConnected ? {} : { hint: getPublicConnectionHint() }),
    });
})



// Server fronted in Production

if (process.env.NODE_ENV === "production") {

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Serve the frontend app

    app.get(/.*/, (req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
    })
}



// last route-level middleware
app.use(notFound);

app.use(errorHandler);

const startServer = async () => {

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });

    connectDB();
};

startServer();