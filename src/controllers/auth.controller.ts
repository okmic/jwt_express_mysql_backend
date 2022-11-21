import { Request, Response, NextFunction } from "express"
import validBody from "../auxiliary/otherFuncs"
import ApiError from '../exceptions/api-error'
import authService from '../service/auth.service'
import { LoginReturn } from "./types"

class AuthController {

    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            validBody(req, next)

            const {email, password, roleId } = req.body
            const ip = req.ip

            if(!ip) return next(ApiError.BadRequest("Ip error"))

            authService.registration(email, ip, password, roleId).then((result: any) => {
                if(result.error) {
                   return next(ApiError.BadRequest(result.error))
                }
            res.cookie("refreshToken", result.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}).status(200).json(result)   
            })
        }
        catch (e) {
            next(e) 
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            validBody(req, next)

            const {email, password, remember} = req.body
            const ip = req.ip

            if(!ip) return next(ApiError.BadRequest("Ip error"))
            
            const userData: LoginReturn = await authService.login(email, password, ip, remember)
            if(remember) res.cookie("refreshToken", userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        }
        catch (e) {
            next(e) 
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.cookies
            const token = await authService.logout(refreshToken)
            res.clearCookie("refreshToken").status(200).json(token)
        }
        catch (e) {
            next(e) 
        }
    }


    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = req.ip
            
            if(!ip) return next(ApiError.BadRequest("Ip error"))
            
            const refreshToken = req.cookies
            const userData = await authService.refresh(refreshToken.refreshToken, ip)
            res.cookie("refreshToken", userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        }
        catch (e) {
            next(e) 
        }
    }

    async changePasswords(req: Request, res: Response, next: NextFunction) {
        try{
            validBody(req, next)

            const accessToken = req.headers.authorization?.split(" ")[1]

            if(!accessToken) {
                return next(ApiError.UnauthorizedError())
            }

            const ip = req.ip
            
            if(!ip) return next(ApiError.BadRequest("Ip error"))
 
            const {oldPassword, newPassword} = req.body

            const userData = await authService.change(accessToken, ip, oldPassword, newPassword).then(res => res)
            return res.cookie("refreshToken", userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}).json(userData)
        } catch(e) {
            next(e) 
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            res.json(await authService.getAllUsers())
        }
        catch (e) {
            next(e)
        }
    }
}

export default new AuthController()