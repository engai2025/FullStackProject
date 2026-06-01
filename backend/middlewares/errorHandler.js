export const errorHandler = (err, req, res, next) => {

    if (err.message?.includes('buffering timed out')) {
        return res.status(503).json({
            success: false,
            message: 'Database is not connected. Check MongoDB Atlas Network Access (0.0.0.0/0 Active) and MONGO_URI_PRO on Render.',
            status: 503
        })
    }

    const status = err.statusCode || 500;

    res.status(status).json({
        success: false,
        message: err.message || 'Something went wrong',
        status,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
}