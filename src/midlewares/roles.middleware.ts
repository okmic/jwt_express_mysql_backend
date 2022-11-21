import { NextFunction, Request, Response } from "express"
import { verify } from "jsonwebtoken"
import ApiError from "../exceptions/api-error"
import { UserRole } from "./types"

const rolesDb = ["admin", "director", "operator", "user"]

export default function(rolesRigth: Array<UserRole>) {

    return async function (req: Request, res: Response, next: NextFunction) {
        try {

            const token = req.headers!.authorization!.split(" ")[1]
                if(!token) {
                    next(ApiError.UnauthorizedError())
                }

            //@ts-ignore
            let {role} = verify(token, process.env.JWT_ACCESS_SECRET_KEY)

            if(!role) next(ApiError.UnauthorizedError()) 

            let hasRole = false
            
             rolesRigth.forEach(userRoles => {
                if (role.includes(userRoles)) {
                    hasRole = true
                }
            }) 
 
            if(!hasRole) {
                next(ApiError.NoRights())
            }
    
            next()
        } catch (e) {
            console.log(e)
            next(ApiError.NoRights())
        }
    }
}