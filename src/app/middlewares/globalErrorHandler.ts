import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"
import { StatusCodes } from "http-status-codes";
import { ZodError, ZodIssue } from "zod" 


const handleZodError = (err: ZodError) => {
    const firstIssue = err.issues[0];

    const message = firstIssue.message;

    const errorDetails = err.issues.map((issue: ZodIssue) => {
        return {
            field: issue.path[issue.path.length - 1] || "unknown_field",
            message: issue.message
        }
    });

    return {
        message: message, 
        error: errorDetails
    }
}

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;

    if (err instanceof ZodError) {
        const formattedError = handleZodError(err);
        
        statusCode = httpStatus.BAD_REQUEST;
        message = formattedError.message;
        error = formattedError.error;
    }

    res.status(statusCode).json({
        success,
        message,
        error
    })
};

export default globalErrorHandler;