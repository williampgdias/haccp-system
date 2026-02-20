import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error: any) {
            if (error instanceof ZodError || error.name === 'ZodError') {
                const issues = error.errors || error.issues || [];

                res.status(400).json({
                    error: 'Validation failed',
                    details: issues.map((err: any) => ({
                        field: err.path ? err.path.join('.') : 'unknown',
                        message: err.message,
                    })),
                });
                return;
            }

            console.error('Unexpected Validation Error:', error);
            res.status(500).json({
                error: 'Internal server error during validation',
            });
        }
    };
};
