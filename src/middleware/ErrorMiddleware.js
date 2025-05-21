// --------------------------------------------------------------------------------
// dependencies
// --------------------------------------------------------------------------------
import { ZodError } from "zod";
import ResponseError from "../utils/ResponseError.js";

// --------------------------------------------------------------------------------
// configure error middleware
// --------------------------------------------------------------------------------
const ErrorMiddleware = async (error, req, res, next) => {
    if (error instanceof ZodError) {
        const { issues } = error;
        return res.status(400).json({
            data: issues.map((issue) => ({
                path: issue.path[0],
                message: issue.message
            }))
        });
    }

    if (error instanceof ResponseError) {
        return res.status(error.status).json({
            message: error.message,
        });
    }

    const status = 500;
    const lines = error.message?.split("\n").map(line => line.trim()).filter(Boolean) || [];

    // Basic structure parsing (can be improved for other errors too)
    const title = lines[0] || "Internal Server Error";
    const lastLine = lines[lines.length - 1];
    const argumentMatch = lastLine?.match(/Argument `(.*?)` is missing/);

    const responseError = {
        title,
        details: {
            message: lastLine,
        }
    };

    if (argumentMatch) {
        responseError.details.argument = argumentMatch[1];
    }

    return res.status(status).json({ error: responseError });
};


// --------------------------------------------------------------------------------
// export default
// --------------------------------------------------------------------------------
export default ErrorMiddleware;