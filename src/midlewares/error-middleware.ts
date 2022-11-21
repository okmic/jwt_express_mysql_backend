import ApiError from "../exceptions/api-error"
import {Request, Response, NextFunction} from "express" 

export default function (err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({message: err.message, errors: err.errors})
    }
    return res.status(500).json({message: "Непредвиденная ошибка"})
}