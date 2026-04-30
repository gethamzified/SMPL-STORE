export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;

    constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }

    static badRequest(message: string) {
        return new AppError(message, 'BAD_REQUEST', 400);
    }

    static unauthorized(message: string = 'Unauthorized') {
        return new AppError(message, 'UNAUTHORIZED', 401);
    }

    static forbidden(message: string = 'Forbidden') {
        return new AppError(message, 'FORBIDDEN', 403);
    }

    static notFound(message: string = 'Not Found') {
        return new AppError(message, 'NOT_FOUND', 404);
    }

    static internal(message: string = 'Internal Server Error') {
        return new AppError(message, 'INTERNAL_ERROR', 500);
    }
}
