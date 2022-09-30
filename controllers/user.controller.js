const {validationResult} = require("express-validator")
const ApiError = require('../exceptions/api-error')
const userService = require('../service/user.service')

class UserController {

    async registration(req, res, next) {
        try {
            const errors = validationResult(req)

                if(!errors.isEmpty()) {
                    return next(ApiError.BadRequest("Invalid value", errors.array()))
                }

            const {email, password} = req.body

            userService.registration(email, password).then(result => {
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

    async login(req, res, next) {
        try {
            const {email, password} = req.body
            const userData = await userService.login(email, password)
            return res.cookie("refreshToken", userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}).json(userData)
        }
        catch (e) {
            next(e) 
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies
            const token = await userService.logout(refreshToken)
            res.clearCookie("refreshToken").status(200).json(token)
        }
        catch (e) {
            next(e) 
        }
    }

    async activate(req, res, next) {
        try {
        
            const result = await userService.activate(req.query.link)

            if(result) {
                return res.redirect(process.env.CLIENT_URL)
            }  else {
                return res.status(401)
            }
            
        }
        catch (e) {
            next(e) 
        }
    }

    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies
            const userData = await userService.refresh(refreshToken.refreshToken)
            res.cookie("refreshToken", userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        }
        catch (e) {
            next(e) 
        }
    }

    async getUsers(req, res, next) {
        try {
            res.json(await userService.getAllUsers())
        }
        catch (e) {
            next(e) 
        }
    }
}

module.exports = new UserController()