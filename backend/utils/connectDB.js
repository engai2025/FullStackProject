import mongoose from 'mongoose';

let lastConnectionError = null;
let reconnectTimer = null;

const sanitizeUri = (uri) => {
    if (!uri) return uri;

    let cleaned = uri.trim();

    if (
        (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
        cleaned = cleaned.slice(1, -1).trim();
    }

    return cleaned;
};

const encodeMongoPassword = (uri) => {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);

    if (!match) return uri;

    const [, protocol, user, password, rest] = match;
    const encodedPassword = encodeURIComponent(decodeURIComponent(password));

    return `${protocol}${user}:${encodedPassword}@${rest}`;
};

const normalizeAtlasUri = (uri) => {
    if (!uri.includes('mongodb+srv://') && !uri.includes('mongodb://')) return uri;

    const [base, query = ''] = uri.split('?');
    const params = new URLSearchParams(query);

    if (!params.has('retryWrites')) params.set('retryWrites', 'true');
    if (!params.has('w')) params.set('w', 'majority');
    if (!params.has('authSource')) params.set('authSource', 'admin');

    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
};

const isLocalDev = () => {
    return process.env.NODE_ENV == "development" && !process.env.RENDER;
};

export const getMongoUri = () => {
    let uri;

    if (isLocalDev()) {
        uri = sanitizeUri(process.env.MONGO_URI_DEV);
    } else {
        uri = sanitizeUri(process.env.MONGO_URI_PRO || process.env.MONGO_URI);
    }

    if (!uri) return uri;

    return normalizeAtlasUri(encodeMongoPassword(uri));
};

export const getConnectionStatus = () => ({
    lastError: lastConnectionError,
    host: getMongoHost(getMongoUri()),
});

export const getPublicConnectionHint = () => {
    if (!lastConnectionError) {
        return 'Set MONGO_URI_PRO on Render with database expense-manager';
    }

    const msg = lastConnectionError.toLowerCase();

    if (msg.includes('ssl') || msg.includes('tls') || msg.includes('alert')) {
        return 'MongoDB TLS failed. On Render, set MONGO_URI_PRO exactly from Atlas (Connect → Drivers). Use user engai2025_db_user, database expense-manager, authSource=admin. Ensure Atlas Network Access 0.0.0.0/0 is Active.';
    }

    if (msg.includes('auth') || msg.includes('authentication')) {
        return 'MongoDB auth failed. Reset Atlas password for engai2025_db_user and update MONGO_URI_PRO on Render.';
    }

    if (msg.includes('whitelist') || msg.includes('ip')) {
        return 'MongoDB IP blocked. Atlas → Network Access → add 0.0.0.0/0 and wait until Status is Active.';
    }

    return 'Check MONGO_URI_PRO on Render and Atlas Network Access (0.0.0.0/0 Active).';
};

const getMongoHost = (uri) => {
    if (!uri) return null;

    try {
        return uri.includes('@') ? uri.split('@')[1].split('/')[0] : null;
    } catch {
        return null;
    }
};

const logUriHost = (uri) => {
    const host = getMongoHost(uri) || 'unknown';
    console.log('MongoDB host:', host);

    if (!host.includes('0avphrx')) {
        console.warn('⚠️  Expected cluster host cluster0.0avphrx.mongodb.net — verify MONGO_URI_PRO on Render');
    }
};

const getAtlasOptions = () => ({
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    authSource: 'admin',
    ...(process.env.RENDER === 'true'
        ? { autoSelectFamily: true }
        : { family: 4 }),
});

const scheduleReconnect = () => {
    if (reconnectTimer || mongoose.connection.readyState === 1) return;

    reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        console.log('Retrying MongoDB connection...');
        await connectDB({ silent: true });
    }, 15000);
};

export const connectDB = async ({ silent = false } = {}) => {

    const mongoUri = getMongoUri();

    if (!mongoUri) {
        lastConnectionError = 'MONGO_URI_PRO is not set on Render';
        if (!silent) console.log("❌ MongoDB URI missing. Set MONGO_URI_PRO in Render Environment.");
        scheduleReconnect();
        return false;
    }

    if (mongoose.connection.readyState === 1) {
        return true;
    }

    if (mongoose.connection.readyState !== 0) {
        try {
            await mongoose.disconnect();
        } catch {
            // ignore
        }
    }

    if (!silent) {
        lastConnectionError = null;
        console.log("NODE_ENV:", process.env.NODE_ENV);
        console.log("Running on Render:", process.env.RENDER === "true");
        console.log("Mongo URI Exists:", !!mongoUri);
        console.log("Mongo URI source:", isLocalDev() ? "MONGO_URI_DEV (local)" : "MONGO_URI_PRO (Atlas)");
        logUriHost(mongoUri);
    }

    mongoose.set('bufferCommands', false);

    if (!mongoose.connection.listenerCount('connected')) {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB Connected Successfully');
            console.log('MongoDB database:', mongoose.connection.name);
            lastConnectionError = null;
        });

        mongoose.connection.on('error', (err) => {
            lastConnectionError = err.message;
            console.log('MongoDB Connection Failed:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB Disconnected');
            scheduleReconnect();
        });
    }

    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            if (!silent) console.log(`Connecting to MongoDB... (attempt ${attempt}/5)`);
            await mongoose.connect(mongoUri, getAtlasOptions());
            console.log(`✅ MongoDB connected (${process.env.NODE_ENV || "production"})`);
            return true;
        } catch (err) {
            lastConnectionError = err.message;
            if (!silent) console.log(`MongoDB attempt ${attempt} failed:`, err.message);

            if (err.message.includes('whitelist') || err.message.includes('IP')) {
                console.log('❌ Atlas → Network Access → 0.0.0.0/0 → wait until Active (green)');
            }

            if (err.message.includes('SSL') || err.message.includes('tls')) {
                console.log('❌ TLS error → confirm password, authSource=admin, and 0.0.0.0/0 is Active on Atlas');
            }

            if (err.message.includes('authentication') || err.message.includes('bad auth')) {
                console.log('❌ Auth failed → reset password for engai2025_db_user in Atlas Database Access');
            }

            if (attempt < 5) {
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
        }
    }

    if (!silent) {
        console.log('❌ Could not connect to MongoDB. Server keeps running and will retry.');
        console.log(getPublicConnectionHint());
    }

    scheduleReconnect();
    return false;
};
