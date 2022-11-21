import {Request, Response, NextFunction} from "express"
import ApiError from "../exceptions/api-error"
import tokenService from "../service/token.service"

export default () => (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization

        if(!authHeader) {
            next(ApiError.UnauthorizedError())
            return
        }
        //berer
        const accessToken = authHeader.split(" ")[1]
        if(!accessToken) {
            next(ApiError.UnauthorizedError())
        }
        const userData = tokenService.validateToken(accessToken, "access")
        if(!userData) {
            return next(ApiError.UnauthorizedError())
        }
        //@ts-ignore
        req.user = userData
        next()
    } catch (e) {
        next(ApiError.UnauthorizedError())
    }
}