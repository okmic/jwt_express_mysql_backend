import { PayloadJWTType } from "./types"
import jwt from "jsonwebtoken"
import { execute } from "../db"
import ApiError from "../exceptions/api-error"

class TokenService {
    generateTokens(payload: PayloadJWTType) {

        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY as string, { expiresIn: "5h" })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY as string, { expiresIn: "30d" })

        return { accessToken, refreshToken }
    }

    validateToken(token: string, type: "access" | "refresh") {
        try{
            return jwt.verify(token, type === "access" ? process.env.JWT_ACCESS_SECRET_KEY as string : process.env.JWT_REFRESH_SECRET_KEY as string)
        } catch (e: any) {
            throw ApiError.UnauthorizedError()
        }
    }

    async saveToken(userId: number, ip: string, refreshToken: string) {
        try {
            const userToken = await execute("SELECT * FROM tokens WHERE userId = ? OR userIp = ?", [userId, ip]).then(result => result.rows)
            
            if (userToken.length > 0) {
                const { rows } = await execute("UPDATE tokens SET userId = ?, userIp = ?, refreshToken = ? WHERE userId = ? OR userIp = ?", [userId, ip, refreshToken, userId, ip])

                return rows
            }

            const { rows } = await execute("INSERT INTO tokens(userId, userIp, refreshToken) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE userId=?, userIp = ?, refreshToken=?", [userId, ip, refreshToken, userId, ip, refreshToken])

            return rows
        }
        catch (e) {
            throw e
        }
    }

    async removeToken(refreshToken: string) {
        try {
            const { rows } = await execute("DELETE FROM `tokens` WHERE `refreshToken` = ?", [refreshToken])

            return rows
        }
        catch (e) {
            throw e
        }
    }

    async findToken(refreshToken: string) {
        try {
            const { rows } = await execute("SELECT * FROM `tokens` WHERE `refreshToken` = ?", [refreshToken])
            return rows
        }
        catch (e) {
            throw e
        }
    }

}

export default new TokenService()