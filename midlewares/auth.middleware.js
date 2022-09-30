const ApiError = require("../exceptions/api-error")
const tokenService = require("../service/token.service")

module.exports = function (req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if(!authHeader) {
            next(ApiError.UnauthorizedError())
        }
        //berer
        const accessToken = authHeader.split(" ")[1]
        if(!accessToken) {
            next(ApiError.UnauthorizedError())
        }
        const userData = tokenService.validateToken(accessToken, process.env.JWT_ACCESS_SECRET_KEY)
        if(!userData) {
            return next(ApiError.UnauthorizedError())
        }

        req.user = userData
        next()
    } catch (e) {
        next(ApiError.UnauthorizedError())
    }
}