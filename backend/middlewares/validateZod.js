export const validate = (schema) => (req, res, next) => {

    const result = schema.safeParse(req.body);

    if (!result.success) {
        const formatted = result.error.format();

        const errors = Object.keys(formatted)
            .filter(field => field !== '_errors' && formatted[field]?._errors?.length)
            .map(field => ({
                field,
                message: formatted[field]._errors[0]
            }));

        if (process.env.NODE_ENV === 'development') {
            console.log('Validation failed:', req.method, req.originalUrl);
            console.log('Password Length:', req.body?.password?.length ?? 0);
            console.log('Errors:', errors);
        } else {
            console.log('Validation failed:', req.method, req.originalUrl);
            console.log('Password Length:', req.body?.password?.length ?? 0);
        }

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        })
    }
    next();
}