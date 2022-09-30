const jwt = require("jsonwebtoken")
const {execute} = require("../db")

class TokenService {
    generateTokens(payload) {

        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, {expiresIn: "30m" })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: "30d" })

        return {accessToken, refreshToken}
    }

    validateToken(token, secretKey) {
        try{
            return jwt.verify(token, secretKey)
        } catch (e) {
            return false
        }
    }

    async saveToken(userId, refreshToken) {
       
        const userToken = await execute("SELECT * FROM `tokens` WHERE `user_id` = ?", [userId]).then(result => result.rows)

        if(userToken.length > 0) {
            const {rows} = await execute("UPDATE `tokens` SET `refresh_token`= ? WHERE `user_id` = ?", [refreshToken, userId])
            
            return rows
        }

        const {rows} = await execute("INSERT INTO `tokens`(`user_id`, `refresh_token`) VALUES (?, ?)", [userId, refreshToken])

        return rows
    }

    async removeToken(refreshToken) {
        const {rows} = await execute("DELETE FROM `tokens` WHERE `refresh_token` = ?", [refreshToken])

        return rows
    }

    async findToken(refreshToken) {
        const {rows} = await execute("SELECT * FROM `tokens` WHERE `refresh_token` = ?", [refreshToken])
        return rows
    }
    
}

module.exports = new TokenService()