import mongoose from 'mongoose';
import { getPublicConnectionHint } from '../utils/connectDB.js';

export const dbCheck = (req, res, next) => {

    const readyState = mongoose.connection.readyState;

    if (readyState === 1) return next();

    console.log("Mongo Ready State:", readyState);
    console.log("Database check failed for:", req.method, req.originalUrl);

    return res.status(503).json({
        success: false,
        message: getPublicConnectionHint(),
    });
};
